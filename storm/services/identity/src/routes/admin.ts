import { Router } from "express";
import type { Redis } from "ioredis";
import type { PrismaClient } from "@prisma/client";
import {
  StormError,
  ErrorCodes,
  AdminUserListQuerySchema,
  AdminBlockSchema,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";
import type { KeySet } from "../auth/keys.js";
import { CSRF_COOKIE } from "../auth/cookies.js";
import { requireAccessToken, requireAdmin } from "../auth/middleware.js";
import { adminUserService } from "../services/adminUserService.js";

export interface AdminRouterDeps {
  prisma: PrismaClient;
  redis: Redis;
  config: Config;
  keys: KeySet;
  logger: Logger;
}

export function adminRouter(deps: AdminRouterDeps): Router {
  const router = Router();
  const svc = adminUserService(deps);
  const accessGuard = requireAccessToken({
    config: deps.config,
    keys: deps.keys,
    redis: deps.redis,
  });
  const adminGuard = requireAdmin();

  router.get("/api/admin/users", accessGuard, adminGuard, async (req, res, next) => {
    try {
      const filters = AdminUserListQuerySchema.parse(req.query);
      const result = await svc.list(filters);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/admin/users/:id", accessGuard, adminGuard, async (req, res, next) => {
    try {
      const detail = await svc.detail(req.params.id!);
      res.json(detail);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/admin/users/:id/block", accessGuard, adminGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = AdminBlockSchema.parse(req.body);
      await svc.block(req.identity!.userId, req.params.id!, body.reason);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/admin/users/:id/unblock", accessGuard, adminGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      await svc.unblock(req.identity!.userId, req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function verifyCsrf(req: import("express").Request): boolean {
  const header = req.header("x-csrf-token");
  const cookie = req.cookies?.[CSRF_COOKIE] as string | undefined;
  if (!header || !cookie) return false;
  if (header.length !== cookie.length) return false;
  let mismatch = 0;
  for (let i = 0; i < header.length; i += 1) mismatch |= header.charCodeAt(i) ^ cookie.charCodeAt(i);
  return mismatch === 0;
}

function invalidCsrf(): StormError {
  return new StormError({
    code: ErrorCodes.CSRF_INVALID,
    message: "CSRF token missing or mismatched.",
    status: 403,
  });
}
