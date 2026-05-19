import type { PrismaClient, Prisma, User } from "@prisma/client";
import type { Redis } from "ioredis";
import { StormError, ErrorCodes, IdentityEventTypes } from "@storm/contracts";
import type { Logger } from "@storm/logger";
import { uuidv7 } from "uuidv7";

import { deleteAllSessions } from "../auth/sessions.js";
import { bumpTokenVersion } from "../auth/tokenVersion.js";
import { appendOutbox } from "../outbox/writer.js";

export interface AdminUserServiceDeps {
  prisma: PrismaClient;
  redis: Redis;
  logger: Logger;
}

export interface ListFilters {
  q?: string | undefined;
  role?: "customer" | "admin" | undefined;
  blocked?: boolean | undefined;
  createdAfter?: string | undefined;
  page: number;
  pageSize: number;
}

export function adminUserService(deps: AdminUserServiceDeps) {
  const { prisma, redis, logger } = deps;

  async function list(filters: ListFilters) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (filters.role) where.role = filters.role;
    if (typeof filters.blocked === "boolean") where.blocked = filters.blocked;
    if (filters.createdAfter) where.createdAt = { gte: new Date(filters.createdAfter) };
    if (filters.q) {
      const q = filters.q.trim();
      if (q.length > 0) {
        where.OR = [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ];
      }
    }
    const skip = (filters.page - 1) * filters.pageSize;
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.pageSize,
      }),
      prisma.user.count({ where }),
    ]);
    return {
      items: rows.map(toPublic),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async function detail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { deletedAt: null },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        profileChanges: {
          orderBy: { changedAt: "desc" },
          take: 20,
        },
      },
    });
    if (!user) throw notFound();

    const auditLogs = await prisma.auditLog.findMany({
      where: { subjectId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      user: toPublic(user),
      addresses: user.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        fullName: a.fullName,
        mobile: a.mobile,
        line1: a.line1,
        line2: a.line2,
        landmark: a.landmark,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        country: a.country,
        isDefault: a.isDefault,
        createdAt: a.createdAt.toISOString(),
      })),
      profileChanges: user.profileChanges.map((c) => ({
        id: c.id,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
        changedAt: c.changedAt.toISOString(),
      })),
      auditLog: auditLogs.map((a) => ({
        id: a.id,
        actorId: a.actorId,
        action: a.action,
        metadata: a.metadata,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  async function block(actorId: string, userId: string, reason: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();
    if (user.blocked) {
      throw new StormError({
        code: ErrorCodes.CONFLICT,
        message: "User already blocked.",
        status: 409,
      });
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { blocked: true } });
      await tx.auditLog.create({
        data: {
          id: uuidv7(),
          actorId,
          subjectId: userId,
          action: "user.blocked",
          metadata: { reason },
        },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserBlocked,
        payload: {
          userId,
          email: user.email,
          name: user.name,
          reason,
        },
      });
    });
    await deleteAllSessions(redis, userId);
    await bumpTokenVersion(redis, userId);
    logger.info({ userId, actorId, reason }, "user_blocked");
  }

  async function unblock(actorId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw notFound();
    if (!user.blocked) {
      throw new StormError({
        code: ErrorCodes.CONFLICT,
        message: "User is not blocked.",
        status: 409,
      });
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { blocked: false } });
      await tx.auditLog.create({
        data: {
          id: uuidv7(),
          actorId,
          subjectId: userId,
          action: "user.unblocked",
          metadata: {},
        },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserUnblocked,
        payload: {
          userId,
          email: user.email,
          name: user.name,
        },
      });
    });
    // Do NOT bump tokenVersion — user must log in fresh anyway because
    // their sessions were already revoked at block-time.
    logger.info({ userId, actorId }, "user_unblocked");
  }

  return { list, detail, block, unblock };
}

export type AdminUserService = ReturnType<typeof adminUserService>;

function toPublic(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    mobile: user.mobile,
    role: user.role,
    blocked: user.blocked,
    emailVerified: user.emailVerified,
    mobileVerified: user.mobileVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

function notFound(): StormError {
  return new StormError({
    code: ErrorCodes.NOT_FOUND,
    message: "User not found.",
    status: 404,
  });
}
