import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";
import type { Logger } from "@storm/logger";
import {
  CatalogEventTypes,
  InventoryEventTypes,
  ProductPublishedPayload,
  ProductUpdatedPayload,
  ProductArchivedPayload,
  CategoryEventPayload,
  BrandEventPayload,
  InventoryStockChangedPayload,
  EventEnvelopeSchema,
  type EventEnvelope,
} from "@storm/contracts";

import type { Config } from "../config.js";
import type { Indexer } from "../services/indexer.js";
import type { catalogClient } from "../services/catalogClient.js";
import type { OpenSearchClient } from "../infra/opensearch.js";
import type { ProductDocRepo } from "../repositories/productDoc.js";
import type { ProcessedEventsRepo } from "../repositories/processedEvents.js";

export interface ConsumerDeps {
  config: Config;
  os: OpenSearchClient;
  logger: Logger;
  indexer: Indexer;
  catalog: ReturnType<typeof catalogClient>;
  productDocs: ProductDocRepo;
  processed: ProcessedEventsRepo;
}

const SUBSCRIBED_TOPICS = [
  CatalogEventTypes.ProductPublished,
  CatalogEventTypes.ProductUpdated,
  CatalogEventTypes.ProductArchived,
  CatalogEventTypes.CategoryUpdated,
  CatalogEventTypes.BrandUpdated,
  InventoryEventTypes.StockChanged,
];

export interface SearchConsumer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createConsumer(deps: ConsumerDeps): SearchConsumer {
  const kafka = new Kafka({
    clientId: deps.config.kafkaClientId,
    brokers: deps.config.kafkaBrokers.split(",").map((s) => s.trim()),
  });
  const consumer: Consumer = kafka.consumer({
    groupId: deps.config.kafkaGroupId,
    allowAutoTopicCreation: true,
  });
  let running = false;

  async function start(): Promise<void> {
    if (running) return;
    await consumer.connect();
    for (const topic of SUBSCRIBED_TOPICS) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }
    running = true;
    await consumer.run({
      autoCommit: true,
      eachMessage: async (payload) => handleMessage(payload, deps),
    });
    deps.logger.info({ topics: SUBSCRIBED_TOPICS }, "search_consumer_started");
  }

  async function stop(): Promise<void> {
    if (!running) return;
    running = false;
    await consumer.disconnect();
  }

  return { start, stop };
}

async function handleMessage(
  payload: EachMessagePayload,
  deps: ConsumerDeps,
): Promise<void> {
  const raw = payload.message.value;
  if (!raw) return;
  let envelope: EventEnvelope;
  try {
    envelope = EventEnvelopeSchema.parse(JSON.parse(raw.toString("utf8")));
  } catch (err) {
    deps.logger.error({ err, topic: payload.topic }, "envelope_parse_failed");
    return;
  }
  const isNew = await deps.processed.markIfNew(envelope.eventId, envelope.eventType);
  if (!isNew) {
    deps.logger.debug({ eventId: envelope.eventId }, "event_duplicate_skipped");
    return;
  }
  try {
    await dispatch(envelope, deps);
  } catch (err) {
    deps.logger.error(
      { err, eventId: envelope.eventId, eventType: envelope.eventType },
      "event_handler_failed",
    );
    // Roll back the dedup marker so a retry/replay can re-process the event.
    await deps.processed.unmark(envelope.eventId).catch(() => undefined);
    throw err;
  }
}

async function dispatch(envelope: EventEnvelope, deps: ConsumerDeps): Promise<void> {
  switch (envelope.eventType) {
    case CatalogEventTypes.ProductPublished: {
      const payload = ProductPublishedPayload.parse(envelope.payload);
      const snap = await deps.catalog.fetchProductBySlug(payload.slug);
      if (!snap) return;
      const result = await deps.indexer.upsertFromSnapshot(snap, envelope.occurredAt);
      deps.logger.info(
        { productId: payload.productId, result, eventType: envelope.eventType },
        "product_indexed",
      );
      return;
    }
    case CatalogEventTypes.ProductUpdated: {
      const payload = ProductUpdatedPayload.parse(envelope.payload);
      // For draft updates we still want to drop any stale doc.
      if (payload.status !== "published") {
        await deps.productDocs.deleteDoc(payload.productId);
        return;
      }
      const snap = await deps.catalog.fetchProductBySlug(payload.slug);
      if (!snap) return;
      const result = await deps.indexer.upsertFromSnapshot(snap, envelope.occurredAt);
      deps.logger.info({ productId: payload.productId, result }, "product_reindexed");
      return;
    }
    case CatalogEventTypes.ProductArchived: {
      const payload = ProductArchivedPayload.parse(envelope.payload);
      await deps.productDocs.deleteDoc(payload.productId);
      deps.logger.info({ productId: payload.productId }, "product_removed");
      return;
    }
    case CatalogEventTypes.CategoryUpdated: {
      const payload = CategoryEventPayload.parse(envelope.payload);
      deps.indexer.invalidateRefs();
      const refs = await deps.indexer.loadRefs();
      const node = refs.flatCategories.get(payload.categoryId);
      if (!node) return;
      // Re-denormalize: any product whose categoryIds contain this id gets its
      // categoryNames updated. We rebuild the names by re-fetching the lineage.
      const lineage = await collectAffectedAndUpdate(deps, payload.categoryId);
      deps.logger.info(
        { categoryId: payload.categoryId, products: lineage },
        "category_denormalized",
      );
      return;
    }
    case CatalogEventTypes.BrandUpdated: {
      const payload = BrandEventPayload.parse(envelope.payload);
      deps.indexer.invalidateRefs();
      const refs = await deps.indexer.loadRefs();
      const brand = refs.brands.get(payload.brandId);
      if (!brand) return;
      const updated = await deps.os.updateByQuery({
        index: deps.config.productsIndexAlias,
        refresh: false,
        body: {
          query: { term: { brandId: payload.brandId } },
          script: {
            source: "ctx._source.brandName = params.name",
            lang: "painless",
            params: { name: brand.name },
          },
        },
      });
      deps.logger.info(
        { brandId: payload.brandId, updated: updated.body.updated ?? 0 },
        "brand_denormalized",
      );
      return;
    }
    case InventoryEventTypes.StockChanged: {
      const payload = InventoryStockChangedPayload.parse(envelope.payload);
      const available = payload.quantityOnHand - payload.quantityReserved;
      await deps.productDocs.patchDoc(payload.productId, { inStock: available > 0 });
      deps.logger.info(
        { productId: payload.productId, inStock: available > 0 },
        "search_inStock_updated",
      );
      return;
    }
    default:
      return;
  }
}

// Re-denormalize products affected by a category-name change. We do this by
// scanning the alias for matching categoryIds, then computing fresh lineage
// arrays per product.
async function collectAffectedAndUpdate(
  deps: ConsumerDeps,
  categoryId: string,
): Promise<number> {
  const refs = await deps.indexer.loadRefs();
  // Build a lineage-name table keyed by leaf category id encountered.
  const nameCache = new Map<string, { ids: string[]; names: string[] }>();
  function lineageFor(leafId: string) {
    const cached = nameCache.get(leafId);
    if (cached) return cached;
    const chain: { ids: string[]; names: string[] } = { ids: [], names: [] };
    let cursor = refs.flatCategories.get(leafId);
    const stack: { id: string; name: string }[] = [];
    while (cursor) {
      stack.unshift({ id: cursor.id, name: cursor.name });
      cursor = cursor.parentId ? refs.flatCategories.get(cursor.parentId) : undefined;
    }
    chain.ids = stack.map((s) => s.id);
    chain.names = stack.map((s) => s.name);
    nameCache.set(leafId, chain);
    return chain;
  }

  // Scroll through matches; for Stage 1 the catalog size is small enough that
  // a single search with a generous size suffices.
  const hits = await deps.os.search<{
    hits: { hits: { _id: string; _source: { categoryIds: string[] } }[] };
  }>({
    index: deps.config.productsIndexAlias,
    body: {
      query: { term: { categoryIds: categoryId } },
      _source: ["categoryIds"],
      size: 1000,
    },
  });
  const rows = hits.body.hits.hits;
  if (rows.length === 0) return 0;

  // Build bulk update body.
  const body: Record<string, unknown>[] = [];
  for (const row of rows) {
    const leaf = row._source.categoryIds[row._source.categoryIds.length - 1];
    if (!leaf) continue;
    const chain = lineageFor(leaf);
    body.push({ update: { _index: deps.config.productsIndexAlias, _id: row._id } });
    body.push({ doc: { categoryIds: chain.ids, categoryNames: chain.names } });
  }
  if (body.length === 0) return 0;
  await deps.os.bulk({ body, refresh: false });
  return rows.length;
}
