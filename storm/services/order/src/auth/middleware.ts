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
    const userId = req.header("x-user-id");
    const role = (req.header("x-user-role") ?? "").toLowerCase();
    if (!userId || role !== "admin") {
      return next(
        new StormError({
          code: ErrorCodes.FORBIDDEN,
          message: "Admin role required.",
          status: 403,
        }),
      );
    }
    req.identity = { userId, role: "admin" };
    next();
  };
}
