import { createHash, timingSafeEqual } from "node:crypto";

import argon2 from "argon2";

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// HIBP k-anonymity: send SHA-1 prefix, scan returned list for full hash.
export async function isPasswordPwned(plain: string, userAgent: string): Promise<boolean> {
  const sha1 = createHash("sha1").update(plain).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "User-Agent": userAgent, "Add-Padding": "true" },
  });
  if (!res.ok) {
    // Fail-open: if HIBP is unreachable, don't block signup.
    return false;
  }
  const body = await res.text();
  const target = Buffer.from(suffix);
  for (const line of body.split("\n")) {
    const [hashSuffix] = line.trim().split(":");
    if (!hashSuffix || hashSuffix.length !== target.length) continue;
    const candidate = Buffer.from(hashSuffix);
    if (timingSafeEqual(candidate, target)) return true;
  }
  return false;
}
