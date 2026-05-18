import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// URL-safe random opaque token + its SHA-256 hash (the form persisted server-side).
export function generateOpaqueToken(bytes = 32): { token: string; hash: string } {
  const token = randomBytes(bytes).toString("base64url");
  const hash = hashOpaqueToken(token);
  return { token, hash };
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function compareTokens(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
