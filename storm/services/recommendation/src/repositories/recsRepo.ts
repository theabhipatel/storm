import type { Redis } from "ioredis";

const KEYS = {
  popular: () => "recs:popular",
  categoryTop: (categoryId: string) => `recs:category:${categoryId}:top`,
  coPurchase: (sku: string) => `co-purchase:${sku}`,
  userRecs: (userId: string) => `recs:user:${userId}`,
  productRecs: (productId: string) => `recs:product:${productId}`,
};

export function recsRepo(redis: Redis) {
  async function incrementPopularity(args: {
    productId: string;
    sku: string;
    categoryId: string;
    qty: number;
  }) {
    await Promise.all([
      redis.zincrby(KEYS.popular(), args.qty, args.productId),
      redis.zincrby(KEYS.categoryTop(args.categoryId), args.qty, args.productId),
    ]);
  }

  async function incrementCoPurchase(skuA: string, skuB: string, score: number) {
    if (skuA === skuB) return;
    await Promise.all([
      redis.zincrby(KEYS.coPurchase(skuA), score, skuB),
      redis.zincrby(KEYS.coPurchase(skuB), score, skuA),
    ]);
  }

  async function topPopular(limit: number): Promise<string[]> {
    return redis.zrevrange(KEYS.popular(), 0, limit - 1);
  }

  async function topInCategory(categoryId: string, limit: number): Promise<string[]> {
    return redis.zrevrange(KEYS.categoryTop(categoryId), 0, limit - 1);
  }

  async function coPurchaseTop(sku: string, limit: number): Promise<string[]> {
    return redis.zrevrange(KEYS.coPurchase(sku), 0, limit - 1);
  }

  async function cacheProductRecs(productId: string, ids: string[], ttlSec: number) {
    const key = KEYS.productRecs(productId);
    const pipe = redis.multi();
    pipe.del(key);
    if (ids.length > 0) pipe.rpush(key, ...ids);
    pipe.expire(key, ttlSec);
    await pipe.exec();
  }

  async function getCachedProductRecs(productId: string): Promise<string[] | null> {
    const exists = await redis.exists(KEYS.productRecs(productId));
    if (!exists) return null;
    return redis.lrange(KEYS.productRecs(productId), 0, -1);
  }

  async function cacheUserRecs(userId: string, ids: string[], ttlSec: number) {
    const key = KEYS.userRecs(userId);
    const pipe = redis.multi();
    pipe.del(key);
    if (ids.length > 0) pipe.rpush(key, ...ids);
    pipe.expire(key, ttlSec);
    await pipe.exec();
  }

  async function getCachedUserRecs(userId: string): Promise<string[] | null> {
    const exists = await redis.exists(KEYS.userRecs(userId));
    if (!exists) return null;
    return redis.lrange(KEYS.userRecs(userId), 0, -1);
  }

  async function removeFromAllSets(productId: string) {
    // Best-effort cleanup on Product.Archived / Product.Deleted.
    await redis.zrem(KEYS.popular(), productId);
    // Category top sets are scanned lazily; the score will just become inert.
  }

  async function seedProduct(args: {
    productId: string;
    sku: string;
    categoryId: string;
  }) {
    // Initialize with a tiny score so the product appears in eligible lists
    // before any order has happened (so the catalog isn't empty on day 0).
    await Promise.all([
      redis.zadd(KEYS.popular(), "NX", "0.01", args.productId),
      redis.zadd(KEYS.categoryTop(args.categoryId), "NX", "0.01", args.productId),
    ]);
  }

  return {
    incrementPopularity,
    incrementCoPurchase,
    topPopular,
    topInCategory,
    coPurchaseTop,
    cacheProductRecs,
    getCachedProductRecs,
    cacheUserRecs,
    getCachedUserRecs,
    removeFromAllSets,
    seedProduct,
  };
}

export type RecsRepo = ReturnType<typeof recsRepo>;
