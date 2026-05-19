import { randomInt } from "node:crypto";

import type { PrismaClient } from "@prisma/client";
import type { Redis } from "ioredis";
import { StormError, ErrorCodes, IdentityEventTypes } from "@storm/contracts";
import type { Logger } from "@storm/logger";
import { uuidv7 } from "uuidv7";

import type { Config } from "../config.js";
import { verifyPassword } from "../auth/password.js";
import { generateOpaqueToken, hashOpaqueToken } from "../auth/randomToken.js";
import { deleteAllSessions } from "../auth/sessions.js";
import { bumpTokenVersion } from "../auth/tokenVersion.js";
import { appendOutbox } from "../outbox/writer.js";

export interface ProfileServiceDeps {
  prisma: PrismaClient;
  redis: Redis;
  config: Config;
  logger: Logger;
}

const EMAIL_CHANGE_KEY = (jti: string): string => `emailchange:${jti}`;
const MOBILE_CHANGE_KEY = (userId: string): string => `mobilechange:${userId}`;
const MAX_OTP_ATTEMPTS = 3;

export function profileService(deps: ProfileServiceDeps) {
  const { prisma, redis, config, logger } = deps;

  async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { deletedAt: null, isDefault: true },
          take: 1,
        },
      },
    });
    if (!user || user.deletedAt) throw notFound();
    const [defaultAddress] = user.addresses;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      emailVerified: user.emailVerified,
      mobileVerified: user.mobileVerified,
      blocked: user.blocked,
      createdAt: user.createdAt.toISOString(),
      defaultAddress: defaultAddress
        ? {
            id: defaultAddress.id,
            label: defaultAddress.label,
            line1: defaultAddress.line1,
            city: defaultAddress.city,
            state: defaultAddress.state,
            pincode: defaultAddress.pincode,
          }
        : null,
    };
  }

  async function updateName(userId: string, newName: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();
    if (user.name === newName) return;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { name: newName } });
      await tx.profileChange.create({
        data: {
          id: uuidv7(),
          userId,
          field: "name",
          oldValue: user.name,
          newValue: newName,
        },
      });
    });
    logger.info({ userId }, "profile_name_updated");
  }

  async function requestEmailChange(
    userId: string,
    newEmailRaw: string,
    currentPassword: string,
  ): Promise<void> {
    const newEmail = newEmailRaw.toLowerCase();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();
    if (!user.passwordHash) throw invalidCredentials();
    if (!(await verifyPassword(user.passwordHash, currentPassword))) {
      throw invalidCredentials();
    }
    if (user.email === newEmail) {
      throw new StormError({
        code: ErrorCodes.BAD_REQUEST,
        message: "New email matches current email.",
        status: 400,
      });
    }
    const taken = await prisma.user.findUnique({ where: { email: newEmail } });
    if (taken && taken.id !== userId) {
      throw new StormError({
        code: ErrorCodes.EMAIL_TAKEN,
        message: "Email already in use.",
        status: 409,
      });
    }

    const token = generateOpaqueToken(32);
    const expiresAt = new Date(Date.now() + config.emailVerifyTtlSec * 1000);

    await redis.set(
      EMAIL_CHANGE_KEY(token.hash),
      JSON.stringify({ userId, newEmail }),
      "EX",
      config.emailVerifyTtlSec,
    );

    await prisma.$transaction(async (tx) => {
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserEmailChangeRequested,
        payload: {
          userId,
          oldEmail: user.email,
          newEmail,
          name: user.name,
          verificationToken: token.token,
          expiresAt: expiresAt.toISOString(),
        },
      });
    });
    logger.info({ userId }, "email_change_requested");
  }

  async function confirmEmailChange(token: string): Promise<void> {
    const jti = hashOpaqueToken(token);
    const raw = await redis.get(EMAIL_CHANGE_KEY(jti));
    if (!raw) {
      throw new StormError({
        code: ErrorCodes.TOKEN_INVALID,
        message: "Confirmation link is invalid or expired.",
        status: 400,
      });
    }
    const { userId, newEmail } = JSON.parse(raw) as { userId: string; newEmail: string };
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();

    const conflict = await prisma.user.findUnique({ where: { email: newEmail } });
    if (conflict && conflict.id !== userId) {
      await redis.del(EMAIL_CHANGE_KEY(jti));
      throw new StormError({
        code: ErrorCodes.EMAIL_TAKEN,
        message: "Email already in use.",
        status: 409,
      });
    }

    const oldEmail = user.email;
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { email: newEmail, emailVerified: true },
      });
      await tx.profileChange.create({
        data: {
          id: uuidv7(),
          userId,
          field: "email",
          oldValue: oldEmail,
          newValue: newEmail,
        },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserEmailChanged,
        payload: {
          userId,
          oldEmail,
          newEmail,
          name: user.name,
        },
      });
    });
    await redis.del(EMAIL_CHANGE_KEY(jti));
    await deleteAllSessions(redis, userId);
    await bumpTokenVersion(redis, userId);
    logger.info({ userId }, "email_changed");
  }

  async function requestMobileChange(
    userId: string,
    newMobile: string,
    currentPassword: string,
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();
    if (!user.passwordHash) throw invalidCredentials();
    if (!(await verifyPassword(user.passwordHash, currentPassword))) {
      throw invalidCredentials();
    }
    if (user.mobile === newMobile) {
      throw new StormError({
        code: ErrorCodes.BAD_REQUEST,
        message: "New mobile matches current mobile.",
        status: 400,
      });
    }

    const otp = generateNumericOtp(6);
    const hash = hashOpaqueToken(otp);
    const expiresAt = new Date(Date.now() + config.otpTtlSec * 1000);

    await redis.set(
      MOBILE_CHANGE_KEY(userId),
      JSON.stringify({ hash, newMobile, attempts: 0 }),
      "EX",
      config.otpTtlSec,
    );

    await prisma.$transaction(async (tx) => {
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserMobileChangeRequested,
        payload: {
          userId,
          oldMobile: user.mobile,
          newMobile,
          otp,
          expiresAt: expiresAt.toISOString(),
        },
      });
    });
    logger.info({ userId }, "mobile_change_requested");
  }

  async function confirmMobileChange(userId: string, otp: string): Promise<void> {
    const raw = await redis.get(MOBILE_CHANGE_KEY(userId));
    if (!raw) {
      throw new StormError({
        code: ErrorCodes.OTP_INVALID,
        message: "OTP invalid or expired.",
        status: 400,
      });
    }
    const record = JSON.parse(raw) as { hash: string; newMobile: string; attempts: number };
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await redis.del(MOBILE_CHANGE_KEY(userId));
      throw new StormError({
        code: ErrorCodes.OTP_EXHAUSTED,
        message: "Too many OTP attempts. Request a new code.",
        status: 429,
      });
    }
    record.attempts += 1;
    if (hashOpaqueToken(otp) !== record.hash) {
      await redis.set(MOBILE_CHANGE_KEY(userId), JSON.stringify(record), "KEEPTTL");
      throw new StormError({
        code: ErrorCodes.OTP_INVALID,
        message: "OTP invalid.",
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();

    const oldMobile = user.mobile;
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { mobile: record.newMobile, mobileVerified: true },
      });
      await tx.profileChange.create({
        data: {
          id: uuidv7(),
          userId,
          field: "mobile",
          oldValue: oldMobile,
          newValue: record.newMobile,
        },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserMobileChanged,
        payload: {
          userId,
          oldMobile,
          newMobile: record.newMobile,
          email: user.email,
          name: user.name,
        },
      });
    });
    await redis.del(MOBILE_CHANGE_KEY(userId));
    logger.info({ userId }, "mobile_changed");
  }

  async function deleteAccount(userId: string, currentPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();
    if (!user.passwordHash) throw invalidCredentials();
    if (!(await verifyPassword(user.passwordHash, currentPassword))) {
      throw invalidCredentials();
    }

    const deletedAt = new Date();
    const placeholderEmail = `deleted-${uuidv7()}@storm.local`;

    // Step 1: emit goodbye event using real email/name BEFORE anonymizing.
    await prisma.$transaction(async (tx) => {
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserDeleted,
        payload: {
          userId,
          email: user.email,
          name: user.name,
          deletedAt: deletedAt.toISOString(),
        },
      });
    });

    // Step 2: anonymize + audit. Done in a separate tx so the goodbye event
    // is durably persisted before PII is wiped.
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          email: placeholderEmail,
          name: "Deleted User",
          mobile: null,
          mobileVerified: false,
          emailVerified: false,
          passwordHash: null,
          deletedAt,
        },
      });
      await tx.profileChange.create({
        data: {
          id: uuidv7(),
          userId,
          field: "deletedAt",
          oldValue: null,
          newValue: deletedAt.toISOString(),
        },
      });
      // Soft-delete all addresses too.
      await tx.address.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt },
      });
    });

    await deleteAllSessions(redis, userId);
    await bumpTokenVersion(redis, userId);
    logger.info({ userId }, "account_deleted");
  }

  return {
    getMe,
    updateName,
    requestEmailChange,
    confirmEmailChange,
    requestMobileChange,
    confirmMobileChange,
    deleteAccount,
  };
}

export type ProfileService = ReturnType<typeof profileService>;

function notFound(): StormError {
  return new StormError({
    code: ErrorCodes.NOT_FOUND,
    message: "User not found.",
    status: 404,
  });
}

function invalidCredentials(): StormError {
  return new StormError({
    code: ErrorCodes.INVALID_CREDENTIALS,
    message: "Current password is incorrect.",
    status: 401,
  });
}

function generateNumericOtp(digits: number): string {
  const max = 10 ** digits;
  return randomInt(0, max).toString().padStart(digits, "0");
}
