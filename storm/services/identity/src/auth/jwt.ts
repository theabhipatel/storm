import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import type { Config } from "../config.js";
import type { KeySet } from "./keys.js";

export type AccessRole = "customer" | "admin";

export interface AccessTokenClaims extends JWTPayload {
  sub: string;
  role: AccessRole;
  sid: string;
  tv: number;
}

export interface SignAccessTokenInput {
  userId: string;
  role: AccessRole;
  sessionId: string;
  tokenVersion: number;
}

export async function signAccessToken(
  input: SignAccessTokenInput,
  keys: KeySet,
  config: Config,
): Promise<string> {
  return new SignJWT({
    role: input.role,
    sid: input.sessionId,
    tv: input.tokenVersion,
  })
    .setProtectedHeader({ alg: keys.alg, kid: keys.kid, typ: "JWT" })
    .setSubject(input.userId)
    .setIssuer(config.jwtIssuer)
    .setAudience(config.jwtAudience)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTokenTtlSec}s`)
    .sign(keys.privateKey);
}

export async function verifyAccessToken(
  token: string,
  keys: KeySet,
  config: Config,
): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, keys.publicKey, {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
    algorithms: [keys.alg],
  });
  return payload as AccessTokenClaims;
}
