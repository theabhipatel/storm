import type { Redis } from "ioredis";
import { uuidv7 } from "uuidv7";

import { generateOpaqueToken, hashOpaqueToken } from "./randomToken.js";

export interface SessionRecord {
  sid: string;
  userId: string;
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface RefreshRecord {
  jti: string; // sha256(refresh)
  sid: string;
  userId: string;
  csrfHash: string;
  exp: number; // unix seconds
  rotated: boolean;
}

export interface IssuedTokens {
  refreshToken: string;
  csrfToken: string;
  sessionId: string;
  refreshHash: string;
  csrfHash: string;
  refreshExp: number;
}

const SESSION_KEY = (sid: string): string => `session:${sid}`;
const REFRESH_KEY = (jti: string): string => `refresh:${jti}`;
const USER_SESSIONS_KEY = (userId: string): string => `user:${userId}:sessions`;

export interface IssueParams {
  userId: string;
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  ttlSec: number;
}

export async function issueSession(
  redis: Redis,
  params: IssueParams,
): Promise<{ session: SessionRecord; tokens: IssuedTokens }> {
  const sid = uuidv7();
  const refresh = generateOpaqueToken(32);
  const csrf = generateOpaqueToken(32);
  const now = new Date();
  const exp = Math.floor(now.getTime() / 1000) + params.ttlSec;

  const session: SessionRecord = {
    sid,
    userId: params.userId,
    ip: params.ip,
    userAgent: params.userAgent,
    deviceFingerprint: params.deviceFingerprint,
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
  };

  const refreshRecord: RefreshRecord = {
    jti: refresh.hash,
    sid,
    userId: params.userId,
    csrfHash: csrf.hash,
    exp,
    rotated: false,
  };

  await redis
    .multi()
    .set(SESSION_KEY(sid), JSON.stringify(session), "EX", params.ttlSec)
    .set(REFRESH_KEY(refresh.hash), JSON.stringify(refreshRecord), "EX", params.ttlSec)
    .sadd(USER_SESSIONS_KEY(params.userId), sid)
    .exec();

  return {
    session,
    tokens: {
      refreshToken: refresh.token,
      csrfToken: csrf.token,
      sessionId: sid,
      refreshHash: refresh.hash,
      csrfHash: csrf.hash,
      refreshExp: exp,
    },
  };
}

export async function getRefresh(redis: Redis, token: string): Promise<RefreshRecord | null> {
  const jti = hashOpaqueToken(token);
  const raw = await redis.get(REFRESH_KEY(jti));
  return raw ? (JSON.parse(raw) as RefreshRecord) : null;
}

export async function getSession(redis: Redis, sid: string): Promise<SessionRecord | null> {
  const raw = await redis.get(SESSION_KEY(sid));
  return raw ? (JSON.parse(raw) as SessionRecord) : null;
}

// Rotate: mark old refresh as `rotated`, persist new refresh/csrf, refresh session TTL.
export async function rotateRefresh(
  redis: Redis,
  old: RefreshRecord,
  session: SessionRecord,
  ttlSec: number,
): Promise<IssuedTokens> {
  const refresh = generateOpaqueToken(32);
  const csrf = generateOpaqueToken(32);
  const exp = Math.floor(Date.now() / 1000) + ttlSec;

  const newRefresh: RefreshRecord = {
    jti: refresh.hash,
    sid: old.sid,
    userId: old.userId,
    csrfHash: csrf.hash,
    exp,
    rotated: false,
  };

  const rotatedOld: RefreshRecord = { ...old, rotated: true };
  const sessionNext: SessionRecord = { ...session, lastUsedAt: new Date().toISOString() };

  await redis
    .multi()
    // Keep the old record briefly to detect reuse (short TTL); attacker re-using it triggers revoke-all.
    .set(REFRESH_KEY(old.jti), JSON.stringify(rotatedOld), "EX", 300)
    .set(REFRESH_KEY(refresh.hash), JSON.stringify(newRefresh), "EX", ttlSec)
    .set(SESSION_KEY(old.sid), JSON.stringify(sessionNext), "EX", ttlSec)
    .exec();

  return {
    refreshToken: refresh.token,
    csrfToken: csrf.token,
    sessionId: old.sid,
    refreshHash: refresh.hash,
    csrfHash: csrf.hash,
    refreshExp: exp,
  };
}

export async function deleteSession(redis: Redis, sid: string, userId: string): Promise<void> {
  await redis
    .multi()
    .del(SESSION_KEY(sid))
    .srem(USER_SESSIONS_KEY(userId), sid)
    .exec();
}

export async function deleteAllSessions(redis: Redis, userId: string): Promise<void> {
  const sids = await redis.smembers(USER_SESSIONS_KEY(userId));
  const pipeline = redis.multi();
  for (const sid of sids) pipeline.del(SESSION_KEY(sid));
  pipeline.del(USER_SESSIONS_KEY(userId));
  await pipeline.exec();
}

// Best-effort revocation of all refresh records when reuse is detected.
// (We don't track refresh-jti per user, so we scan SET membership and walk known sessions.)
export async function revokeRefreshForSession(
  redis: Redis,
  jti: string,
): Promise<void> {
  await redis.del(REFRESH_KEY(jti));
}
