import type { RequestHandler } from "express";
import { mergeContext } from "@storm/logger";

export interface AuthContext {
  userId?: string;
  roles?: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Reads gateway-injected identity headers (Kong forwards a verified JWT's
 * claims as X-User-Id / X-User-Roles). Services trust these only because the
 * gateway strips them from inbound requests and re-injects after verification.
 */
export function authContext(): RequestHandler {
  return (req, _res, next) => {
    const userId = req.header("x-user-id");
    const rolesHeader = req.header("x-user-roles");
    const roles = rolesHeader ? rolesHeader.split(",").map((r) => r.trim()) : undefined;

    req.auth = {
      ...(userId ? { userId } : {}),
      ...(roles ? { roles } : {}),
    };

    if (userId) mergeContext({ userId });
    next();
  };
}
