import type { Redis } from "ioredis";

const KEY = (userId: string): string => `user:${userId}:tokenVersion`;
export const TOKEN_VERSION_CHANNEL = "user.tokenVersion.bumped";

export async function getTokenVersion(redis: Redis, userId: string): Promise<number> {
  const raw = await redis.get(KEY(userId));
  if (raw === null) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function setTokenVersion(
  redis: Redis,
  userId: string,
  version: number,
): Promise<void> {
  await redis.set(KEY(userId), String(version));
}

// Atomically bump and publish — Kong gateway nodes subscribe to invalidate caches.
export async function bumpTokenVersion(redis: Redis, userId: string): Promise<number> {
  const next = await redis.incr(KEY(userId));
  await redis.publish(TOKEN_VERSION_CHANNEL, JSON.stringify({ userId, tokenVersion: next }));
  return next;
}
