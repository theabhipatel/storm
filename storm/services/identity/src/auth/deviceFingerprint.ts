import { createHash } from "node:crypto";

import type { Redis } from "ioredis";

const KEY = (userId: string): string => `newdevice:${userId}`;

export function computeDeviceFingerprint(userAgent: string, ip: string): string {
  // Use the /24 of IPv4 (or /48 of IPv6) so minor address shifts don't flap.
  const ipClass = normalizeIp(ip);
  return createHash("sha256").update(`${userAgent}|${ipClass}`).digest("hex").slice(0, 32);
}

function normalizeIp(ip: string): string {
  if (ip.includes(":")) {
    return ip.split(":").slice(0, 3).join(":");
  }
  return ip.split(".").slice(0, 3).join(".");
}

export async function isKnownDevice(
  redis: Redis,
  userId: string,
  fingerprint: string,
): Promise<boolean> {
  return (await redis.sismember(KEY(userId), fingerprint)) === 1;
}

export async function rememberDevice(
  redis: Redis,
  userId: string,
  fingerprint: string,
): Promise<void> {
  await redis.sadd(KEY(userId), fingerprint);
}
