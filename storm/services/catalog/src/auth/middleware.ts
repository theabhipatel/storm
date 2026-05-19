import type { RequestHandler } from "express";
import { StormError, ErrorCodes } from "@storm/contracts";

export interface IdentifiedUser {
  userId: string;
  role: "customer" | "admin";
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
 * Kong verifies the JWT and injects identity headers. This service trusts the
 * headers since only the gateway can reach it in production. In local dev,
 * curl/Postman can set the same headers directly.
 */
export function requireAuth(): RequestHandler {
  return (req, _res, next) => {
    const userId = req.header("x-user-id");
    const role = (req.header("x-user-role") ?? "").toLowerCase();
    if (!userId || (role !== "customer" && role !== "admin")) {
      return next(
        new StormError({
          code: ErrorCodes.UNAUTHENTICATED,
          message: "Authentication required.",
          status: 401,
        }),
      );
    }
    req.identity = { userId, role: role as IdentifiedUser["role"] };
    next();
  };
}

export function requireAdmin(): RequestHandler {
  return (req, _res, next) => {
    if (!req.identity) {
      return next(
        new StormError({
          code: ErrorCodes.UNAUTHENTICATED,
          message: "Authentication required.",
          status: 401,
        }),
      );
    }
    if (req.identity.role !== "admin") {
      return next(
        new StormError({
          code: ErrorCodes.FORBIDDEN,
          message: "Admin role required.",
          status: 403,
        }),
      );
    }
    next();
  };
}
