import { exportJWK, importPKCS8, importSPKI, type JWK, type KeyLike } from "jose";

import type { Config } from "../config.js";

export interface KeySet {
  privateKey: KeyLike;
  publicKey: KeyLike;
  publicJwk: JWK;
  kid: string;
  alg: "RS256";
}

const ALG = "RS256" as const;

function decodePem(value: string): string {
  // Accept either raw PEM or base64-encoded PEM.
  if (value.includes("BEGIN")) return value;
  return Buffer.from(value, "base64").toString("utf8");
}

export async function loadKeySet(config: Config): Promise<KeySet> {
  const privPem = decodePem(config.jwtPrivateKey);
  const pubPem = decodePem(config.jwtPublicKey);

  const privateKey = await importPKCS8(privPem, ALG);
  const publicKey = await importSPKI(pubPem, ALG);
  const publicJwk = await exportJWK(publicKey);

  publicJwk.kid = config.jwtKid;
  publicJwk.alg = ALG;
  publicJwk.use = "sig";

  return { privateKey, publicKey, publicJwk, kid: config.jwtKid, alg: ALG };
}
