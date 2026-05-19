import type { Logger } from "@storm/logger";

import type { OpenSearchClient } from "../infra/opensearch.js";
import {
  PRODUCTS_INDEX_MAPPING,
  PRODUCTS_INDEX_SETTINGS,
} from "../infra/mapping.js";
import { nextVersionedIndex, resolveAliasTarget } from "../infra/bootstrap.js";
import type { catalogClient, CategoryNode, ProductSnapshot } from "./catalogClient.js";
import { categoryLineage, flattenCategories } from "./catalogClient.js";
import type { mediaClient } from "./mediaClient.js";
import type { ProductDoc } from "../repositories/productDoc.js";

export interface ReindexResult {
  fromIndex: string | null;
  toIndex: string;
  documents: number;
  swappedAlias: boolean;
}

export interface ReindexDeps {
  os: OpenSearchClient;
  alias: string;
  catalog: ReturnType<typeof catalogClient>;
  media: ReturnType<typeof mediaClient>;
  logger: Logger;
}

// Rebuild the products index from the catalog source of truth, then atomically
// swap the alias to the new version. Old index is left in place for one cycle
// so a rollback is a single alias swap.
export function reindexService(deps: ReindexDeps) {
  async function run(): Promise<ReindexResult> {
    const fromIndex = await resolveAliasTarget(deps.os, deps.alias);
    const toIndex = nextVersionedIndex(fromIndex, deps.alias);
    await deps.os.indices.create({
      index: toIndex,
      body: {
        settings: PRODUCTS_INDEX_SETTINGS as unknown as Record<string, unknown>,
        mappings: PRODUCTS_INDEX_MAPPING as unknown as Record<string, unknown>,
      },
    });

    const [brands, tree] = await Promise.all([
      deps.catalog.fetchBrands(),
      deps.catalog.fetchCategoryTree(),
    ]);
    const flat = flattenCategories(tree);
    const brandMap = new Map(brands.map((b) => [b.id, b]));

    // Pull every published product slug. catalog-service's admin list is paged
    // and lives behind admin auth — for the reindex flow we walk the category
    // tree and call its public slug endpoint per known product instead.
    // Stage 1: pragmatic fallback — scan the source-of-truth via a dedicated
    // admin endpoint added later. For now we scroll the existing index for
    // known productIds and re-build their docs.
    const sourceIds = await scanProductIds(deps.os, fromIndex);

    let documents = 0;
    for (const productId of sourceIds) {
      try {
        const snap = await fetchSnapshotById(deps, productId);
        if (!snap) continue;
        const doc = await buildDoc(deps, snap, brandMap, tree, flat);
        if (!doc) continue;
        await deps.os.index({
          index: toIndex,
          id: snap.id,
          body: doc as unknown as Record<string, unknown>,
        });
        documents += 1;
      } catch (err) {
        deps.logger.warn({ err, productId }, "reindex_doc_failed");
      }
    }

    await deps.os.indices.refresh({ index: toIndex });

    const actions: Record<string, unknown>[] = [{ add: { index: toIndex, alias: deps.alias } }];
    if (fromIndex && fromIndex !== toIndex) {
      actions.unshift({ remove: { index: fromIndex, alias: deps.alias } });
    }
    await deps.os.indices.updateAliases({ body: { actions } });
    deps.logger.info({ fromIndex, toIndex, documents }, "reindex_complete");

    return {
      fromIndex,
      toIndex,
      documents,
      swappedAlias: true,
    };
  }

  return { run };
}

async function scanProductIds(
  os: OpenSearchClient,
  fromIndex: string | null,
): Promise<string[]> {
  if (!fromIndex) return [];
  const ids: string[] = [];
  const { body } = await os.search<{
    hits: { hits: { _id: string }[] };
  }>({
    index: fromIndex,
    body: { _source: false, query: { match_all: {} }, size: 10000 },
  });
  for (const h of body.hits.hits) ids.push(h._id);
  return ids;
}

async function fetchSnapshotById(
  deps: ReindexDeps,
  productId: string,
): Promise<ProductSnapshot | null> {
  // Walk the existing alias to recover the slug, then call catalog by slug.
  try {
    const cur = await deps.os.get<{ _source: { slug?: string } }>({
      index: deps.alias,
      id: productId,
    });
    const slug = cur.body._source?.slug;
    if (!slug) return null;
    return deps.catalog.fetchProductBySlug(slug);
  } catch {
    return null;
  }
}

async function buildDoc(
  deps: ReindexDeps,
  snap: ProductSnapshot,
  brands: Map<string, { id: string; name: string }>,
  tree: CategoryNode[],
  _flat: Map<string, CategoryNode>,
): Promise<ProductDoc | null> {
  if (snap.status !== "published") return null;
  const brand = brands.get(snap.brandId);
  if (!brand) return null;
  const lineage = categoryLineage(tree, snap.categoryId);
  if (lineage.length === 0) return null;
  let primaryImageUrl: string | null = null;
  const primary = snap.media.find((m) => m.isPrimary) ?? snap.media[0];
  if (primary) {
    try {
      const [asset] = await deps.media.fetchBatch([primary.mediaId]);
      primaryImageUrl = asset?.original ?? null;
    } catch {
      // tolerated
    }
  }
  return {
    productId: snap.id,
    sku: snap.sku,
    slug: snap.slug,
    name: snap.name,
    description: snap.description,
    brandId: brand.id,
    brandName: brand.name,
    categoryIds: lineage.map((c) => c.id),
    categoryNames: lineage.map((c) => c.name),
    attributes: snap.attributes,
    basePrice: snap.basePrice,
    currency: snap.currency,
    inStock: true,
    popularityScore: 0,
    primaryImageUrl,
    status: "published",
    createdAt: snap.createdAt,
    updatedAt: new Date().toISOString(),
  };
}
