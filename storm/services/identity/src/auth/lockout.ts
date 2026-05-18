import type { Redis } from "ioredis";

const LOCKOUT_KEY = (userId: string): string => `lockout:${userId}`;
const FAIL_KEY = (userId: string): string => `lockout:${userId}:fails`;

// Exponential backoff steps after consecutive failures (seconds).
const BACKOFF_SEC = [60, 300, 900, 3600, 14400];

export interface LockoutStatus {
  locked: boolean;
  retryAfterSec: number;
}

export async function getLockoutStatus(redis: Redis, userId: string): Promise<LockoutStatus> {
  const ttl = await redis.ttl(LOCKOUT_KEY(userId));
  if (ttl > 0) return { locked: true, retryAfterSec: ttl };
  return { locked: false, retryAfterSec: 0 };
}

export async function recordLoginSuccess(redis: Redis, userId: string): Promise<void> {
  await redis.del(FAIL_KEY(userId), LOCKOUT_KEY(userId));
}

// Increments the failure counter. Every 5 failures applies the next backoff bucket.
export async function recordLoginFailure(
  redis: Redis,
  userId: string,
): Promise<LockoutStatus> {
  const fails = await redis.incr(FAIL_KEY(userId));
  if (fails === 1) await redis.expire(FAIL_KEY(userId), 24 * 60 * 60);
  if (fails % 5 !== 0) return { locked: false, retryAfterSec: 0 };
  const idx = Math.min(BACKOFF_SEC.length - 1, Math.floor(fails / 5) - 1);
  const ttl = BACKOFF_SEC[idx]!;
  await redis.set(LOCKOUT_KEY(userId), "1", "EX", ttl);
  return { locked: true, retryAfterSec: ttl };
}
