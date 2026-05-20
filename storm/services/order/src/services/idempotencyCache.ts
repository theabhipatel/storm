import type { Redis } from "ioredis";

export interface IdempotencyCache {
  get(userId: string, key: string): Promise<string | null>;
  set(userId: string, key: string, value: string): Promise<void>;
}

export function createIdempotencyCache(opts: { redis: Redis; ttlSec: number }): IdempotencyCache {
  function k(userId: string, key: string): string {
    return `idem:${userId}:${key}`;
  }
  return {
    async get(userId, key) {
      return opts.redis.get(k(userId, key));
    },
    async set(userId, key, value) {
      await opts.redis.set(k(userId, key), value, "EX", opts.ttlSec);
    },
  };
}
