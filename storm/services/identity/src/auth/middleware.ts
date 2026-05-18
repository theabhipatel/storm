import type { RequestHandler } from "express";
import type { Redis } from "ioredis";
import { StormError, ErrorCodes } from "@storm/contracts";
import { errors as joseErrors } from "jose";

import type { Config } from "../config.js";
import { getSession } from "./sessions.js";
import { verifyAccessToken, type AccessRole } from "./jwt.js";
import type { KeySet } from "./keys.js";
import { getTokenVersion } from "./tokenVersion.js";

export interface IdentifiedUser {
  userId: string;
  role: AccessRole;
  sessionId: string;
  tokenVersion: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      identity?: IdentifiedUser;
    }
  }
}

/**
 * In production, Kong verifies the JWT, strips it, and injects identity headers.
 * In dev (no gateway), we accept Authorization: Bearer <jwt> as a fallback so
 * the service is usable end-to-end before Phase 7 wires Kong.
 */
export function requireAccessToken(opts: {
  config: Config;
  keys: KeySet;
  redis: Redis;
}): RequestHandler {
  return async (req, _res, next) => {
    try {
      const fromHeaders = readIdentityHeaders(req);
      if (fromHeaders) {
        req.identity = fromHeaders;
        return next();
      }

      const auth = req.header("authorization");
      if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
        return next(unauthenticated("Missing access token."));
      }
      const token = auth.slice("bearer ".length).trim();
      let claims;
      try {
        claims = await verifyAccessToken(token, opts.keys, opts.config);
      } catch (err) {
        if (err instanceof joseErrors.JWTExpired) {
          return next(
            new StormError({
              code: ErrorCodes.TOKEN_EXPIRED,
              message: "Access token expired.",
              status: 401,
            }),
          );
        }
        return next(
          new StormError({
            code: ErrorCodes.TOKEN_INVALID,
            message: "Access token invalid.",
            status: 401,
          }),
        );
      }

      const tv = await getTokenVersion(opts.redis, claims.sub);
      if (tv !== claims.tv) {
        return next(
          new StormError({
            code: ErrorCodes.TOKEN_INVALID,
            message: "Access token revoked.",
            status: 401,
          }),
        );
      }

      const session = await getSession(opts.redis, claims.sid);
      if (!session) {
        return next(unauthenticated("Session not found."));
      }

      req.identity = {
        userId: claims.sub,
        role: claims.role,
        sessionId: claims.sid,
        tokenVersion: claims.tv,
      };
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

function readIdentityHeaders(req: import("express").Request): IdentifiedUser | null {
  const userId = req.header("x-user-id");
  const role = req.header("x-user-role") as AccessRole | undefined;
  const sessionId = req.header("x-session-id");
  const tv = req.header("x-token-version");
  if (!userId || !role || !sessionId || !tv) return null;
  return { userId, role, sessionId, tokenVersion: Number.parseInt(tv, 10) || 0 };
}

function unauthenticated(message: string): StormError {
  return new StormError({ code: ErrorCodes.UNAUTHENTICATED, message, status: 401 });
}
