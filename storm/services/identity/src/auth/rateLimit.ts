import type { Redis } from "ioredis";

export interface RateLimitResult {
  count: number;
  remaining: number;
  limited: boolean;
  resetAtSec: number;
}

// Simple fixed-window counter with TTL on first increment.
export async function incrementRateLimit(
  redis: Redis,
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const fullKey = `rl:${key}`;
  const tx = await redis.multi().incr(fullKey).ttl(fullKey).exec();
  if (!tx) throw new Error("rate_limit_tx_failed");
  const count = Number(tx[0]?.[1] ?? 0);
  const ttl = Number(tx[1]?.[1] ?? -1);
  if (ttl < 0) await redis.expire(fullKey, windowSec);
  const resetAtSec = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : windowSec);
  return {
    count,
    remaining: Math.max(0, limit - count),
    limited: count > limit,
    resetAtSec,
  };
}
