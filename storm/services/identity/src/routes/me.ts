import { Router } from "express";
import type { Redis } from "ioredis";
import type { PrismaClient } from "@prisma/client";
import {
  StormError,
  ErrorCodes,
  AddressCreateSchema,
  AddressUpdateSchema,
  ProfileUpdateSchema,
  EmailChangeRequestSchema,
  EmailChangeConfirmSchema,
  MobileChangeRequestSchema,
  MobileChangeConfirmSchema,
  AccountDeleteSchema,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";
import type { KeySet } from "../auth/keys.js";
import { CSRF_COOKIE, clearAuthCookies } from "../auth/cookies.js";
import { requireAccessToken } from "../auth/middleware.js";
import { profileService } from "../services/profileService.js";
import { addressService } from "../services/addressService.js";

export interface MeRouterDeps {
  prisma: PrismaClient;
  redis: Redis;
  config: Config;
  keys: KeySet;
  logger: Logger;
}

export function meRouter(deps: MeRouterDeps): Router {
  const router = Router();
  const profile = profileService(deps);
  const addresses = addressService(deps);
  const accessGuard = requireAccessToken({
    config: deps.config,
    keys: deps.keys,
    redis: deps.redis,
  });

  // --- profile ---
  router.get("/api/me", accessGuard, async (req, res, next) => {
    try {
      const me = await profile.getMe(req.identity!.userId);
      res.json({ user: me });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/me", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = ProfileUpdateSchema.parse(req.body);
      await profile.updateName(req.identity!.userId, body.name);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/me/email/change", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = EmailChangeRequestSchema.parse(req.body);
      await profile.requestEmailChange(
        req.identity!.userId,
        body.newEmail,
        body.currentPassword,
      );
      res.status(202).json({ status: "verification_email_sent" });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/me/email/change/confirm", async (req, res, next) => {
    try {
      const body = EmailChangeConfirmSchema.parse(req.body);
      await profile.confirmEmailChange(body.token);
      clearAuthCookies(res, deps.config);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/me/mobile/change", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = MobileChangeRequestSchema.parse(req.body);
      await profile.requestMobileChange(
        req.identity!.userId,
        body.newMobile,
        body.currentPassword,
      );
      res.status(202).json({ status: "otp_sent" });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/me/mobile/change/confirm", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = MobileChangeConfirmSchema.parse(req.body);
      await profile.confirmMobileChange(req.identity!.userId, body.otp);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/me/delete", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = AccountDeleteSchema.parse(req.body);
      await profile.deleteAccount(req.identity!.userId, body.currentPassword);
      clearAuthCookies(res, deps.config);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // --- addresses ---
  router.get("/api/me/addresses", accessGuard, async (req, res, next) => {
    try {
      const items = await addresses.list(req.identity!.userId);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/me/addresses", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = AddressCreateSchema.parse(req.body);
      const address = await addresses.create(req.identity!.userId, body);
      res.status(201).json({ address });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/me/addresses/:id", accessGuard, async (req, res, next) => {
    try {
      const address = await addresses.get(req.identity!.userId, req.params.id!);
      res.json({ address });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/me/addresses/:id", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const body = AddressUpdateSchema.parse(req.body);
      const address = await addresses.update(req.identity!.userId, req.params.id!, body);
      res.json({ address });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/me/addresses/:id", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      await addresses.remove(req.identity!.userId, req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/me/addresses/:id/set-default", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const address = await addresses.setDefault(req.identity!.userId, req.params.id!);
      res.json({ address });
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
