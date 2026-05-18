import { Router } from "express";
import type { Redis } from "ioredis";
import type { PrismaClient } from "@prisma/client";
import { StormError, ErrorCodes } from "@storm/contracts";
import type { Logger } from "@storm/logger";
import { z } from "zod";

import type { Config } from "../config.js";
import type { KeySet } from "../auth/keys.js";
import { CSRF_COOKIE, REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "../auth/cookies.js";
import { incrementRateLimit } from "../auth/rateLimit.js";
import { requireAccessToken } from "../auth/middleware.js";
import { userService } from "../services/userService.js";

const SignupSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(12).max(256),
  name: z.string().min(1).max(120),
});

const VerifyEmailSchema = z.object({
  token: z.string().min(10),
});

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(256),
});

const PasswordResetSchema = z.object({
  email: z.string().email().max(254),
});

const PasswordResetConfirmSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(12).max(256),
});

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(12).max(256),
});

const SendOtpSchema = z.object({
  // E.164 (loose check — provider does final validation)
  mobile: z.string().regex(/^\+[1-9]\d{6,14}$/),
});

const VerifyOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});

const GoogleCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export interface AuthRouterDeps {
  prisma: PrismaClient;
  redis: Redis;
  config: Config;
  keys: KeySet;
  logger: Logger;
}

export function authRouter(deps: AuthRouterDeps): Router {
  const router = Router();
  const svc = userService(deps);
  const accessGuard = requireAccessToken({
    config: deps.config,
    keys: deps.keys,
    redis: deps.redis,
  });

  router.post("/api/auth/signup", async (req, res, next) => {
    try {
      const ip = clientIp(req);
      const limit = await incrementRateLimit(deps.redis, `signup:ip:${ip}`, 5, 60 * 60);
      if (limit.limited) return next(rateLimited(limit.resetAtSec));

      const body = SignupSchema.parse(req.body);
      await svc.signup(body);
      res.status(202).json({ status: "verification_email_sent" });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/verify-email", async (req, res, next) => {
    try {
      const body = VerifyEmailSchema.parse(req.body);
      await svc.verifyEmail(body.token);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/login", async (req, res, next) => {
    try {
      const ip = clientIp(req);
      const ipLimit = await incrementRateLimit(deps.redis, `login:ip:${ip}`, 5, 15 * 60);
      if (ipLimit.limited) return next(rateLimited(ipLimit.resetAtSec));

      const body = LoginSchema.parse(req.body);
      const emailLimit = await incrementRateLimit(
        deps.redis,
        `login:email:${body.email.toLowerCase()}`,
        10,
        60 * 60,
      );
      if (emailLimit.limited) return next(rateLimited(emailLimit.resetAtSec));

      const result = await svc.login(body, { ip, userAgent: req.header("user-agent") ?? "" });
      setAuthCookies(res, deps.config, result.tokens.refreshToken, result.tokens.csrfToken);
      res.json({
        accessToken: result.accessToken,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/refresh", async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      if (!refreshToken) return next(unauthenticated("Missing refresh token."));

      if (!verifyCsrf(req)) return next(invalidCsrf());

      const result = await svc.refresh(refreshToken, {
        ip: clientIp(req),
        userAgent: req.header("user-agent") ?? "",
      });
      setAuthCookies(res, deps.config, result.tokens.refreshToken, result.tokens.csrfToken);
      res.json({
        accessToken: result.accessToken,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/logout", async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());

      const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      if (refreshToken) {
        const { getRefresh, deleteSession, revokeRefreshForSession } = await import(
          "../auth/sessions.js"
        );
        const record = await getRefresh(deps.redis, refreshToken);
        if (record) {
          await deleteSession(deps.redis, record.sid, record.userId);
          await revokeRefreshForSession(deps.redis, record.jti);
        }
      }
      clearAuthCookies(res, deps.config);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/logout-all", accessGuard, async (req, res, next) => {
    try {
      if (!verifyCsrf(req)) return next(invalidCsrf());
      const userId = req.identity!.userId;
      await svc.logoutAll(userId);
      clearAuthCookies(res, deps.config);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/auth/me", accessGuard, async (req, res, next) => {
    try {
      const user = await svc.me(req.identity!.userId);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/password-reset", async (req, res, next) => {
    try {
      const body = PasswordResetSchema.parse(req.body);
      const limit = await incrementRateLimit(
        deps.redis,
        `pwreset:email:${body.email.toLowerCase()}`,
        3,
        60 * 60,
      );
      if (limit.limited) return next(rateLimited(limit.resetAtSec));
      await svc.requestPasswordReset(body.email);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/password-reset/confirm", async (req, res, next) => {
    try {
      const body = PasswordResetConfirmSchema.parse(req.body);
      await svc.confirmPasswordReset(body.token, body.password);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/password-change", accessGuard, async (req, res, next) => {
    try {
      const body = PasswordChangeSchema.parse(req.body);
      const result = await svc.changePassword(
        req.identity!.userId,
        body.currentPassword,
        body.newPassword,
        { ip: clientIp(req), userAgent: req.header("user-agent") ?? "" },
      );
      setAuthCookies(res, deps.config, result.tokens.refreshToken, result.tokens.csrfToken);
      res.json({
        accessToken: result.accessToken,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/mobile/send-otp", accessGuard, async (req, res, next) => {
    try {
      const body = SendOtpSchema.parse(req.body);
      const limit = await incrementRateLimit(
        deps.redis,
        `otp:user:${req.identity!.userId}`,
        3,
        60 * 60,
      );
      if (limit.limited) return next(rateLimited(limit.resetAtSec));
      await svc.sendOtp(req.identity!.userId, body.mobile);
      res.status(202).json({ status: "otp_sent" });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/auth/mobile/verify-otp", accessGuard, async (req, res, next) => {
    try {
      const body = VerifyOtpSchema.parse(req.body);
      await svc.verifyOtp(req.identity!.userId, body.otp);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/auth/google", async (req, res, next) => {
    try {
      const redirectTo = typeof req.query["redirectTo"] === "string" ? req.query["redirectTo"] : undefined;
      const { authorizeUrl } = await svc.startGoogleOAuth(redirectTo);
      res.redirect(302, authorizeUrl);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/auth/google/callback", async (req, res, next) => {
    try {
      const params = GoogleCallbackSchema.parse(req.query);
      const result = await svc.handleGoogleCallback(params.code, params.state, {
        ip: clientIp(req),
        userAgent: req.header("user-agent") ?? "",
      });
      setAuthCookies(res, deps.config, result.tokens.refreshToken, result.tokens.csrfToken);
      // Redirect to the SPA's OAuth landing page; AuthBootstrap there will refresh
      // the in-memory access token from the refresh cookie.
      const landing = new URL("/auth/login/google/callback", deps.config.webAppOrigin);
      landing.searchParams.set("ok", "1");
      res.redirect(302, landing.toString());
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function clientIp(req: import("express").Request): string {
  const xff = req.header("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.socket.remoteAddress ?? "0.0.0.0";
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

function unauthenticated(message: string): StormError {
  return new StormError({ code: ErrorCodes.UNAUTHENTICATED, message, status: 401 });
}

function invalidCsrf(): StormError {
  return new StormError({
    code: ErrorCodes.CSRF_INVALID,
    message: "CSRF token missing or mismatched.",
    status: 403,
  });
}

function rateLimited(resetAtSec: number): StormError {
  return new StormError({
    code: ErrorCodes.RATE_LIMITED,
    message: "Too many requests. Please try again later.",
    status: 429,
    details: { resetAtSec },
  });
}
