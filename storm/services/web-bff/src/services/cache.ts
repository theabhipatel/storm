import type { Redis } from "ioredis";
import type { Logger } from "@storm/logger";

export interface CacheOptions {
  redis: Redis;
  logger: Logger;
  namespace?: string;
}

// In-process single-flight: collapses concurrent fills for the same key
// so a cold cache + a burst of requests still hits the loader once.
export function createCache(opts: CacheOptions) {
  const ns = opts.namespace ?? "web-bff";
  const inflight = new Map<string, Promise<unknown>>();

  function k(key: string): string {
    return `${ns}:${key}`;
  }

  async function get<T>(key: string): Promise<T | null> {
    try {
      const raw = await opts.redis.get(k(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      opts.logger.warn({ err, key }, "cache_get_failed");
      return null;
    }
  }

  async function set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await opts.redis.set(k(key), JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      opts.logger.warn({ err, key }, "cache_set_failed");
    }
  }

  async function withCache<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const cached = await get<T>(key);
    if (cached !== null) return cached;
    const pending = inflight.get(key);
    if (pending) return pending as Promise<T>;
    const promise = (async () => {
      const fresh = await load();
      await set(key, fresh, ttlSeconds);
      return fresh;
    })().finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, promise);
    return promise;
  }

  async function delByPrefix(prefix: string): Promise<number> {
    const fullPrefix = `${ns}:${prefix}`;
    let cursor = "0";
    let removed = 0;
    do {
      const [next, keys] = await opts.redis.scan(
        cursor,
        "MATCH",
        `${fullPrefix}*`,
        "COUNT",
        200,
      );
      cursor = next;
      if (keys.length > 0) {
        removed += keys.length;
        await opts.redis.del(...keys);
      }
    } while (cursor !== "0");
    return removed;
  }

  return { get, set, withCache, delByPrefix, key: k };
}

export type Cache = ReturnType<typeof createCache>;
