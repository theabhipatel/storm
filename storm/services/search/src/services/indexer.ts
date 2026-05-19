import type { Logger } from "@storm/logger";

import type {
  catalogClient,
  BrandRef,
  CategoryNode,
  ProductSnapshot,
} from "./catalogClient.js";
import { categoryLineage, flattenCategories } from "./catalogClient.js";
import type { mediaClient } from "./mediaClient.js";
import type { ProductDoc, ProductDocRepo } from "../repositories/productDoc.js";

export interface IndexerOptions {
  catalog: ReturnType<typeof catalogClient>;
  media: ReturnType<typeof mediaClient>;
  productDocs: ProductDocRepo;
  logger: Logger;
}

// Caches brand + category lookups per consume tick to keep catalog load down.
// Cache lifetime is intentionally short — denormalization staleness is bounded
// by Category.Updated / Brand.Updated events triggering re-denormalization.
export function indexer(opts: IndexerOptions) {
  let cache: {
    brands: Map<string, BrandRef>;
    tree: CategoryNode[];
    flatCategories: Map<string, CategoryNode>;
    expiresAt: number;
  } | null = null;
  const TTL_MS = 30_000;

  async function loadRefs() {
    const now = Date.now();
    if (cache && cache.expiresAt > now) return cache;
    const [brands, tree] = await Promise.all([
      opts.catalog.fetchBrands(),
      opts.catalog.fetchCategoryTree(),
    ]);
    const brandMap = new Map<string, BrandRef>(brands.map((b) => [b.id, b]));
    const flat = flattenCategories(tree);
    cache = { brands: brandMap, tree, flatCategories: flat, expiresAt: now + TTL_MS };
    return cache;
  }

  function invalidateRefs(): void {
    cache = null;
  }

  async function buildDoc(snap: ProductSnapshot, occurredAt: string): Promise<ProductDoc | null> {
    if (snap.status !== "published") return null;
    const refs = await loadRefs();
    const brand = refs.brands.get(snap.brandId);
    if (!brand) {
      opts.logger.warn({ productId: snap.id, brandId: snap.brandId }, "brand_not_found_skipping");
      return null;
    }
    const lineage = categoryLineage(refs.tree, snap.categoryId);
    if (lineage.length === 0) {
      opts.logger.warn(
        { productId: snap.id, categoryId: snap.categoryId },
        "category_not_found_skipping",
      );
      return null;
    }

    let primaryImageUrl: string | null = null;
    const primary = snap.media.find((m) => m.isPrimary) ?? snap.media[0];
    if (primary) {
      try {
        const [asset] = await opts.media.fetchBatch([primary.mediaId]);
        primaryImageUrl = asset?.original ?? null;
      } catch (err) {
        opts.logger.warn({ err, productId: snap.id }, "media_lookup_failed");
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
      updatedAt: occurredAt,
    };
  }

  async function upsertFromSnapshot(
    snap: ProductSnapshot,
    occurredAt: string,
  ): Promise<"indexed" | "skipped" | "stale"> {
    const existing = await opts.productDocs.getDoc(snap.id);
    if (existing && existing.updatedAt > occurredAt) return "stale";
    const doc = await buildDoc(snap, occurredAt);
    if (!doc) {
      // Snapshot says draft/archived: ensure doc is absent.
      if (existing) await opts.productDocs.deleteDoc(snap.id);
      return "skipped";
    }
    await opts.productDocs.indexDoc(doc);
    return "indexed";
  }

  async function refreshDenormByBrand(brandId: string, name: string): Promise<void> {
    // Lightweight: patch all docs in the alias matching brandId.
    // Implemented via update-by-query in the consumer (see consumer.ts).
    invalidateRefs();
    opts.logger.info({ brandId, name }, "brand_denorm_invalidated");
  }

  async function refreshDenormByCategory(categoryId: string): Promise<void> {
    invalidateRefs();
    opts.logger.info({ categoryId }, "category_denorm_invalidated");
  }

  return {
    buildDoc,
    upsertFromSnapshot,
    invalidateRefs,
    refreshDenormByBrand,
    refreshDenormByCategory,
    loadRefs,
  };
}

export type Indexer = ReturnType<typeof indexer>;
