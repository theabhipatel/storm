import type { RecommendationList, RecommendedProduct } from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";
import type { RecsRepo } from "../repositories/recsRepo.js";
import type { CatalogClient, CatalogProduct } from "./catalogClient.js";
import type { InventoryClient } from "./inventoryClient.js";

const REC_LIMIT = 8;

export interface RecsService {
  forProduct(productId: string): Promise<RecommendationList>;
  forUser(userId: string): Promise<RecommendationList>;
  forCategory(categoryId: string): Promise<RecommendationList>;
}

export function recsService(deps: {
  config: Config;
  repo: RecsRepo;
  catalog: CatalogClient;
  inventory: InventoryClient;
  logger: Logger;
}): RecsService {
  const { config, repo, catalog, inventory, logger } = deps;

  async function shape(productIds: string[], source: RecommendationList["source"]): Promise<RecommendationList> {
    if (productIds.length === 0) return { source, items: [] };
    const products = await catalog.lookupByIds(productIds);
    const skus = products.map((p) => p.sku);
    const stock = await inventory.getStock(skus);
    const byId = new Map(products.map((p) => [p.id, p]));
    const items: RecommendedProduct[] = [];
    for (const id of productIds) {
      const p = byId.get(id);
      if (!p) continue;
      if (p.status !== "published") continue;
      items.push({
        productId: p.id,
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        primaryImageUrl: null,
        basePrice: p.basePrice,
        currency: "INR",
        inStock: (stock.get(p.sku) ?? 0) > 0,
      });
      if (items.length >= REC_LIMIT) break;
    }
    return { source, items };
  }

  async function forProduct(productId: string): Promise<RecommendationList> {
    const cached = await repo.getCachedProductRecs(productId);
    if (cached && cached.length > 0) {
      return shape(cached, "product");
    }
    const [target] = await catalog.lookupByIds([productId]);
    if (!target) return { source: "product", items: [] };

    const minPrice = Math.floor(target.basePrice * (100 - config.popularPriceBandPct) / 100);
    const maxPrice = Math.ceil(target.basePrice * (100 + config.popularPriceBandPct) / 100);

    const candidates = await repo.topInCategory(target.categoryId, REC_LIMIT * 4);
    const fetched = await catalog.lookupByIds(candidates.filter((id) => id !== productId));
    const inBand = filterInBand(fetched, minPrice, maxPrice, productId);
    const chosen = inBand.map((p) => p.id);
    if (chosen.length < REC_LIMIT) {
      // Fallback: category top, ignoring price band.
      const more = fetched.filter((p) => p.id !== productId).map((p) => p.id);
      for (const id of more) {
        if (!chosen.includes(id)) chosen.push(id);
        if (chosen.length >= REC_LIMIT) break;
      }
    }
    if (chosen.length < REC_LIMIT) {
      // Last-resort fallback: site-wide popular.
      const popular = await repo.topPopular(REC_LIMIT * 2);
      for (const id of popular) {
        if (id === productId) continue;
        if (!chosen.includes(id)) chosen.push(id);
        if (chosen.length >= REC_LIMIT) break;
      }
    }
    await repo.cacheProductRecs(productId, chosen, config.productTtlSec);
    return shape(chosen, "product");
  }

  async function forUser(userId: string): Promise<RecommendationList> {
    const cached = await repo.getCachedUserRecs(userId);
    if (cached && cached.length > 0) {
      return shape(cached, "user");
    }
    const popular = await repo.topPopular(REC_LIMIT * 2);
    await repo.cacheUserRecs(userId, popular, config.userTtlSec);
    return shape(popular.slice(0, REC_LIMIT), "popular");
  }

  async function forCategory(categoryId: string): Promise<RecommendationList> {
    const ids = await repo.topInCategory(categoryId, REC_LIMIT * 2);
    if (ids.length === 0) {
      logger.debug({ categoryId }, "category_no_recs_fallback_popular");
      const popular = await repo.topPopular(REC_LIMIT);
      return shape(popular, "popular");
    }
    return shape(ids.slice(0, REC_LIMIT), "category");
  }

  return { forProduct, forUser, forCategory };
}

function filterInBand(
  fetched: CatalogProduct[],
  minPrice: number,
  maxPrice: number,
  excludeId: string,
): CatalogProduct[] {
  return fetched.filter(
    (p) => p.id !== excludeId && p.status === "published" && p.basePrice >= minPrice && p.basePrice <= maxPrice,
  );
}
