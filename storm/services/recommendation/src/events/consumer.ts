import { Kafka, type Consumer, type EachMessagePayload } from "kafkajs";
import type { Logger } from "@storm/logger";
import {
  CatalogEventTypes,
  OrderEventTypes,
  ProductCreatedPayload,
  ProductArchivedPayload,
  OrderConfirmedPayload,
  EventEnvelopeSchema,
  type EventEnvelope,
} from "@storm/contracts";

import type { Config } from "../config.js";
import type { RecsRepo } from "../repositories/recsRepo.js";
import type { CatalogClient } from "../services/catalogClient.js";

export interface RecsConsumer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

const SUBSCRIBED_TOPICS = [
  OrderEventTypes.Confirmed,
  CatalogEventTypes.ProductCreated,
  CatalogEventTypes.ProductArchived,
];

export function createConsumer(deps: {
  config: Config;
  repo: RecsRepo;
  catalog: CatalogClient;
  logger: Logger;
}): RecsConsumer {
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
    deps.logger.info({ topics: SUBSCRIBED_TOPICS }, "recs_consumer_started");
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
  deps: { repo: RecsRepo; catalog: CatalogClient; logger: Logger },
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
  try {
    switch (envelope.eventType) {
      case CatalogEventTypes.ProductCreated: {
        const p = ProductCreatedPayload.parse(envelope.payload);
        if (p.status !== "draft") {
          await deps.repo.seedProduct({
            productId: p.productId,
            sku: p.sku,
            categoryId: p.categoryId,
          });
        }
        return;
      }
      case CatalogEventTypes.ProductArchived: {
        const p = ProductArchivedPayload.parse(envelope.payload);
        await deps.repo.removeFromAllSets(p.productId);
        return;
      }
      case OrderEventTypes.Confirmed: {
        const p = OrderConfirmedPayload.parse(envelope.payload);
        const productIds = p.items.map((i) => i.productId);
        const products = await deps.catalog.lookupByIds(productIds);
        const byId = new Map(products.map((pr) => [pr.id, pr]));
        for (const item of p.items) {
          const cat = byId.get(item.productId);
          if (!cat) continue;
          await deps.repo.incrementPopularity({
            productId: item.productId,
            sku: item.sku,
            categoryId: cat.categoryId,
            qty: item.qty,
          });
        }
        // Co-purchase: every pair gets a bump.
        for (let i = 0; i < p.items.length; i += 1) {
          for (let j = i + 1; j < p.items.length; j += 1) {
            await deps.repo.incrementCoPurchase(p.items[i]!.sku, p.items[j]!.sku, 1);
          }
        }
        return;
      }
      default:
        return;
    }
  } catch (err) {
    deps.logger.error({ err, eventId: envelope.eventId }, "recs_handler_failed");
    throw err;
  }
}
