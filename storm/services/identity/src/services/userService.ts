import { createHash, randomInt } from "node:crypto";

import type { PrismaClient, User } from "@prisma/client";
import type { Redis } from "ioredis";
import { StormError, ErrorCodes, IdentityEventTypes } from "@storm/contracts";
import type { Logger } from "@storm/logger";
import { uuidv7 } from "uuidv7";

import type { Config } from "../config.js";
import { signAccessToken } from "../auth/jwt.js";
import type { KeySet } from "../auth/keys.js";
import { hashPassword, isPasswordPwned, verifyPassword } from "../auth/password.js";
import { generateOpaqueToken, hashOpaqueToken } from "../auth/randomToken.js";
import {
  deleteAllSessions,
  deleteSession,
  getRefresh,
  getSession,
  issueSession,
  rotateRefresh,
  type IssuedTokens,
} from "../auth/sessions.js";
import {
  computeDeviceFingerprint,
  isKnownDevice,
  rememberDevice,
} from "../auth/deviceFingerprint.js";
import {
  getLockoutStatus,
  recordLoginFailure,
  recordLoginSuccess,
} from "../auth/lockout.js";
import { bumpTokenVersion, getTokenVersion } from "../auth/tokenVersion.js";
import { appendOutbox } from "../outbox/writer.js";

export interface UserServiceDeps {
  prisma: PrismaClient;
  redis: Redis;
  config: Config;
  keys: KeySet;
  logger: Logger;
}

export interface RequestContext {
  ip: string;
  userAgent: string;
}

export interface LoginResult {
  accessToken: string;
  accessTokenExpiresAt: string;
  tokens: IssuedTokens;
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  emailVerified: boolean;
  mobileVerified: boolean;
}

const EMAIL_VERIFY_KEY = (jti: string): string => `emailverify:${jti}`;
const PASSWORD_RESET_KEY = (jti: string): string => `pwreset:${jti}`;
const OTP_KEY = (userId: string): string => `otp:${userId}`;
const OAUTH_STATE_KEY = (state: string): string => `oauth:${state}`;
const MAX_OTP_ATTEMPTS = 3;

export function userService(deps: UserServiceDeps) {
  const { prisma, redis, config, keys, logger } = deps;

  async function signup(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ userId: string }> {
    const emailLower = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      // Anti-enumeration: still return success-shaped, but with no event emission.
      // Caller front-end already directs the user to check email; the real account
      // owner gets no duplicate verification email here.
      return { userId: existing.id };
    }

    if (await isPasswordPwned(input.password, config.hibpUserAgent)) {
      throw new StormError({
        code: ErrorCodes.WEAK_PASSWORD,
        message: "Password appears in known breach lists. Please choose another.",
        status: 422,
      });
    }

    const passwordHash = await hashPassword(input.password);
    const userId = uuidv7();
    const verifyToken = generateOpaqueToken(32);
    const expiresAt = new Date(Date.now() + config.emailVerifyTtlSec * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email: emailLower,
          passwordHash,
          name: input.name,
          role: "customer",
        },
      });

      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserCreated,
        payload: { userId, email: emailLower, name: input.name, role: "customer" },
      });

      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserEmailVerificationRequested,
        payload: {
          userId,
          email: emailLower,
          name: input.name,
          verificationToken: verifyToken.token,
          expiresAt: expiresAt.toISOString(),
        },
      });
    });

    await redis.set(
      EMAIL_VERIFY_KEY(verifyToken.hash),
      JSON.stringify({ userId }),
      "EX",
      config.emailVerifyTtlSec,
    );

    logger.info({ userId }, "user_signed_up");
    return { userId };
  }

  async function verifyEmail(token: string): Promise<void> {
    const jti = hashOpaqueToken(token);
    const raw = await redis.get(EMAIL_VERIFY_KEY(jti));
    if (!raw) {
      throw new StormError({
        code: ErrorCodes.TOKEN_INVALID,
        message: "Verification link is invalid or expired.",
        status: 400,
      });
    }
    const { userId } = JSON.parse(raw) as { userId: string };

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
    await redis.del(EMAIL_VERIFY_KEY(jti));
    logger.info({ userId }, "email_verified");
  }

  async function login(
    input: { email: string; password: string },
    ctx: RequestContext,
  ): Promise<LoginResult> {
    const emailLower = input.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    // Constant-ish-time: still hash the password if user missing, then return generic error.
    if (!user) {
      await hashPassword(input.password).catch(() => undefined);
      throw invalidCredentials();
    }

    if (user.blocked) {
      throw new StormError({
        code: ErrorCodes.ACCOUNT_BLOCKED,
        message: "Account is blocked.",
        status: 403,
      });
    }

    const lockout = await getLockoutStatus(redis, user.id);
    if (lockout.locked) {
      throw new StormError({
        code: ErrorCodes.ACCOUNT_LOCKED,
        message: "Too many failed attempts. Try again later.",
        status: 423,
        details: { retryAfterSec: lockout.retryAfterSec },
      });
    }

    if (!user.passwordHash || !(await verifyPassword(user.passwordHash, input.password))) {
      const fail = await recordLoginFailure(redis, user.id);
      if (fail.locked) {
        throw new StormError({
          code: ErrorCodes.ACCOUNT_LOCKED,
          message: "Too many failed attempts. Try again later.",
          status: 423,
          details: { retryAfterSec: fail.retryAfterSec },
        });
      }
      throw invalidCredentials();
    }

    await recordLoginSuccess(redis, user.id);
    return finalizeLogin(user, ctx);
  }

  async function refresh(
    refreshToken: string,
    ctx: RequestContext,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: string; tokens: IssuedTokens }> {
    const record = await getRefresh(redis, refreshToken);
    if (!record) {
      throw new StormError({
        code: ErrorCodes.TOKEN_INVALID,
        message: "Refresh token invalid.",
        status: 401,
      });
    }

    if (record.rotated) {
      // Reuse detected → treat as theft.
      await deleteAllSessions(redis, record.userId);
      await bumpTokenVersion(redis, record.userId);
      throw new StormError({
        code: ErrorCodes.REFRESH_REUSE_DETECTED,
        message: "Session terminated due to suspected token theft.",
        status: 401,
      });
    }

    if (record.exp < Math.floor(Date.now() / 1000)) {
      throw new StormError({
        code: ErrorCodes.TOKEN_EXPIRED,
        message: "Refresh token expired.",
        status: 401,
      });
    }

    const session = await getSession(redis, record.sid);
    if (!session) throw invalidCredentials();

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || user.blocked) {
      await deleteSession(redis, record.sid, record.userId);
      throw new StormError({
        code: ErrorCodes.UNAUTHENTICATED,
        message: "User unavailable.",
        status: 401,
      });
    }

    const tokens = await rotateRefresh(redis, record, session, config.refreshTokenTtlSec);
    const tv = await getTokenVersion(redis, user.id);
    const accessToken = await signAccessToken(
      {
        userId: user.id,
        role: user.role,
        sessionId: session.sid,
        tokenVersion: tv,
      },
      keys,
      config,
    );
    logger.info({ userId: user.id, sid: session.sid, ip: ctx.ip }, "session_refreshed");
    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + config.accessTokenTtlSec * 1000).toISOString(),
      tokens,
    };
  }

  async function logout(sessionId: string, userId: string): Promise<void> {
    await deleteSession(redis, sessionId, userId);
    logger.info({ userId, sid: sessionId }, "session_ended");
  }

  async function logoutAll(userId: string): Promise<void> {
    await deleteAllSessions(redis, userId);
    await bumpTokenVersion(redis, userId);
    logger.info({ userId }, "sessions_revoked_all");
  }

  async function me(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "User not found.",
        status: 404,
      });
    }
    return toPublic(user);
  }

  async function finalizeLogin(user: User, ctx: RequestContext): Promise<LoginResult> {
    const fingerprint = computeDeviceFingerprint(ctx.userAgent, ctx.ip);
    const known = await isKnownDevice(redis, user.id, fingerprint);
    if (!known) {
      await rememberDevice(redis, user.id, fingerprint);
      await prisma.$transaction(async (tx) => {
        await appendOutbox(tx, {
          aggregateId: user.id,
          eventType: IdentityEventTypes.UserNewDeviceLogin,
          payload: {
            userId: user.id,
            email: user.email,
            name: user.name,
            ip: ctx.ip,
            userAgent: ctx.userAgent,
            occurredAt: new Date().toISOString(),
          },
        });
      });
    }

    const { tokens } = await issueSession(redis, {
      userId: user.id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      deviceFingerprint: fingerprint,
      ttlSec: config.refreshTokenTtlSec,
    });

    const tv = await getTokenVersion(redis, user.id);
    const accessToken = await signAccessToken(
      {
        userId: user.id,
        role: user.role,
        sessionId: tokens.sessionId,
        tokenVersion: tv,
      },
      keys,
      config,
    );
    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + config.accessTokenTtlSec * 1000).toISOString(),
      tokens,
      user: toPublic(user),
    };
  }

  async function requestPasswordReset(email: string): Promise<void> {
    const emailLower = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) return; // anti-enumeration

    const token = generateOpaqueToken(32);
    const expiresAt = new Date(Date.now() + config.passwordResetTtlSec * 1000);

    await prisma.$transaction(async (tx) => {
      await appendOutbox(tx, {
        aggregateId: user.id,
        eventType: IdentityEventTypes.UserPasswordResetRequested,
        payload: {
          userId: user.id,
          email: user.email,
          name: user.name,
          resetToken: token.token,
          expiresAt: expiresAt.toISOString(),
        },
      });
    });

    await redis.set(
      PASSWORD_RESET_KEY(token.hash),
      JSON.stringify({ userId: user.id }),
      "EX",
      config.passwordResetTtlSec,
    );
    logger.info({ userId: user.id }, "password_reset_requested");
  }

  async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const jti = hashOpaqueToken(token);
    const raw = await redis.get(PASSWORD_RESET_KEY(jti));
    if (!raw) {
      throw new StormError({
        code: ErrorCodes.TOKEN_INVALID,
        message: "Reset link is invalid or expired.",
        status: 400,
      });
    }
    const { userId } = JSON.parse(raw) as { userId: string };

    if (await isPasswordPwned(newPassword, config.hibpUserAgent)) {
      throw new StormError({
        code: ErrorCodes.WEAK_PASSWORD,
        message: "Password appears in known breach lists. Please choose another.",
        status: 422,
      });
    }

    const passwordHash = await hashPassword(newPassword);
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await appendOutbox(tx, {
        aggregateId: updated.id,
        eventType: IdentityEventTypes.UserPasswordChanged,
        payload: { userId: updated.id, email: updated.email },
      });
      return updated;
    });

    await redis.del(PASSWORD_RESET_KEY(jti));
    await deleteAllSessions(redis, user.id);
    await bumpTokenVersion(redis, user.id);
    logger.info({ userId: user.id }, "password_reset_confirmed");
  }

  async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ctx: RequestContext,
  ): Promise<LoginResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw invalidCredentials();
    if (!(await verifyPassword(user.passwordHash, currentPassword))) {
      throw invalidCredentials();
    }
    if (await isPasswordPwned(newPassword, config.hibpUserAgent)) {
      throw new StormError({
        code: ErrorCodes.WEAK_PASSWORD,
        message: "Password appears in known breach lists. Please choose another.",
        status: 422,
      });
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await appendOutbox(tx, {
        aggregateId: next.id,
        eventType: IdentityEventTypes.UserPasswordChanged,
        payload: { userId: next.id, email: next.email },
      });
      return next;
    });

    // Revoke all sessions + bump tokenVersion, then issue fresh tokens for the current device.
    await deleteAllSessions(redis, userId);
    await bumpTokenVersion(redis, userId);
    logger.info({ userId }, "password_changed");
    return finalizeLogin(updated, ctx);
  }

  async function sendOtp(userId: string, mobile: string): Promise<void> {
    const otp = generateNumericOtp(6);
    const hash = hashOpaqueToken(otp);
    const expiresAt = new Date(Date.now() + config.otpTtlSec * 1000);

    await redis.set(
      OTP_KEY(userId),
      JSON.stringify({ hash, mobile, attempts: 0 }),
      "EX",
      config.otpTtlSec,
    );

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { mobile } });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserOtpRequested,
        payload: { userId, mobile, otp, expiresAt: expiresAt.toISOString() },
      });
    });
    logger.info({ userId, mobile }, "otp_sent");
  }

  async function verifyOtp(userId: string, otp: string): Promise<void> {
    const raw = await redis.get(OTP_KEY(userId));
    if (!raw) {
      throw new StormError({
        code: ErrorCodes.OTP_INVALID,
        message: "OTP invalid or expired.",
        status: 400,
      });
    }
    const record = JSON.parse(raw) as { hash: string; mobile: string; attempts: number };
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await redis.del(OTP_KEY(userId));
      throw new StormError({
        code: ErrorCodes.OTP_EXHAUSTED,
        message: "Too many OTP attempts. Request a new code.",
        status: 429,
      });
    }
    record.attempts += 1;
    if (hashOpaqueToken(otp) !== record.hash) {
      await redis.set(OTP_KEY(userId), JSON.stringify(record), "KEEPTTL");
      throw new StormError({
        code: ErrorCodes.OTP_INVALID,
        message: "OTP invalid.",
        status: 400,
      });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { mobileVerified: true, mobile: record.mobile },
    });
    await redis.del(OTP_KEY(userId));
    logger.info({ userId }, "otp_verified");
  }

  // --- Google OAuth helpers --------------------------------------------------

  async function startGoogleOAuth(redirectTo?: string): Promise<{ authorizeUrl: string }> {
    if (!config.googleOauthClientId || !config.googleOauthRedirectUri) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: "Google OAuth is not configured.",
        status: 503,
      });
    }
    const state = generateOpaqueToken(16).token;
    const verifier = generateOpaqueToken(32).token;
    const challenge = createPkceChallenge(verifier);

    await redis.set(
      OAUTH_STATE_KEY(state),
      JSON.stringify({ verifier, redirectTo: redirectTo ?? "/" }),
      "EX",
      config.oauthStateTtlSec,
    );

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", config.googleOauthClientId);
    url.searchParams.set("redirect_uri", config.googleOauthRedirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");
    return { authorizeUrl: url.toString() };
  }

  async function handleGoogleCallback(
    code: string,
    state: string,
    ctx: RequestContext,
  ): Promise<LoginResult> {
    if (
      !config.googleOauthClientId ||
      !config.googleOauthClientSecret ||
      !config.googleOauthRedirectUri
    ) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: "Google OAuth is not configured.",
        status: 503,
      });
    }
    const raw = await redis.get(OAUTH_STATE_KEY(state));
    if (!raw) {
      throw new StormError({
        code: ErrorCodes.TOKEN_INVALID,
        message: "OAuth state expired or invalid.",
        status: 400,
      });
    }
    await redis.del(OAUTH_STATE_KEY(state));
    const { verifier } = JSON.parse(raw) as { verifier: string; redirectTo: string };

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.googleOauthClientId,
        client_secret: config.googleOauthClientSecret,
        redirect_uri: config.googleOauthRedirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }).toString(),
    });
    if (!tokenRes.ok) {
      throw new StormError({
        code: ErrorCodes.UNAUTHENTICATED,
        message: "Google token exchange failed.",
        status: 401,
      });
    }
    const tokens = (await tokenRes.json()) as { id_token?: string };
    if (!tokens.id_token) {
      throw new StormError({
        code: ErrorCodes.UNAUTHENTICATED,
        message: "Google did not return an ID token.",
        status: 401,
      });
    }

    const { OAuth2Client } = await import("google-auth-library");
    const client = new OAuth2Client(config.googleOauthClientId);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.googleOauthClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new StormError({
        code: ErrorCodes.UNAUTHENTICATED,
        message: "Google did not return a verified email.",
        status: 401,
      });
    }

    const emailLower = payload.email.toLowerCase();
    const providerUserId = payload.sub;
    const displayName = payload.name ?? emailLower.split("@")[0]!;

    const user = await prisma.$transaction(async (tx) => {
      const link = await tx.oAuthAccount.findUnique({
        where: { provider_providerUserId: { provider: "google", providerUserId } },
      });
      if (link) {
        return tx.user.findUniqueOrThrow({ where: { id: link.userId } });
      }
      const existing = await tx.user.findUnique({ where: { email: emailLower } });
      if (existing) {
        await tx.oAuthAccount.create({
          data: { id: uuidv7(), userId: existing.id, provider: "google", providerUserId },
        });
        if (!existing.emailVerified) {
          await tx.user.update({
            where: { id: existing.id },
            data: { emailVerified: true },
          });
        }
        return tx.user.findUniqueOrThrow({ where: { id: existing.id } });
      }
      const userId = uuidv7();
      const created = await tx.user.create({
        data: {
          id: userId,
          email: emailLower,
          name: displayName,
          role: "customer",
          emailVerified: true,
        },
      });
      await tx.oAuthAccount.create({
        data: { id: uuidv7(), userId, provider: "google", providerUserId },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserCreated,
        payload: { userId, email: emailLower, name: displayName, role: "customer" },
      });
      return created;
    });

    return finalizeLogin(user, ctx);
  }

  return {
    signup,
    verifyEmail,
    login,
    refresh,
    logout,
    logoutAll,
    me,
    requestPasswordReset,
    confirmPasswordReset,
    changePassword,
    sendOtp,
    verifyOtp,
    startGoogleOAuth,
    handleGoogleCallback,
  };
}

export type UserService = ReturnType<typeof userService>;

function invalidCredentials(): StormError {
  return new StormError({
    code: ErrorCodes.INVALID_CREDENTIALS,
    message: "Invalid email or password.",
    status: 401,
  });
}

function generateNumericOtp(digits: number): string {
  const max = 10 ** digits;
  return randomInt(0, max).toString().padStart(digits, "0");
}

function createPkceChallenge(verifier: string): string {
  // S256: BASE64URL(SHA-256(verifier))
  return createHash("sha256").update(verifier).digest("base64url");
}

function toPublic(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    mobileVerified: user.mobileVerified,
  };
}
