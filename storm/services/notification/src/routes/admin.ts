import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { MongoState, NotificationLog } from "../infra/mongo.js";

const ListQuerySchema = z.object({
  channel: z.enum(["email", "sms"]).optional(),
  status: z.enum(["queued", "sent", "failed"]).optional(),
  templateId: z.string().min(1).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

function requireAdmin(req: Parameters<RequestHandler>[0]): void {
  const role = req.header("x-user-role");
  if (role !== "admin") {
    throw new StormError({
      code: ErrorCodes.FORBIDDEN,
      message: "Admin role required.",
      status: 403,
    });
  }
}

function serialise(log: NotificationLog & { _id?: unknown }): Record<string, unknown> {
  return {
    id: String(log._id ?? log.eventId),
    eventId: log.eventId,
    userId: log.userId,
    channel: log.channel,
    templateId: log.templateId,
    templateVersion: log.templateVersion,
    status: log.status,
    attempts: log.attempts,
    payload: log.payload,
    providerResponse: log.providerResponse ?? null,
    sentAt: log.sentAt?.toISOString() ?? null,
    failedAt: log.failedAt?.toISOString() ?? null,
    errorMessage: log.errorMessage ?? null,
  };
}

export function adminNotificationsRouter(deps: { mongo: MongoState }): Router {
  const router = Router();

  router.get(
    "/api/admin/notifications",
    asyncRoute(async (req, res) => {
      requireAdmin(req);
      const q = ListQuerySchema.parse(req.query);
      const filter: Record<string, unknown> = {};
      if (q.channel) filter["channel"] = q.channel;
      if (q.status) filter["status"] = q.status;
      if (q.templateId) filter["templateId"] = q.templateId;
      if (q.from || q.to) {
        const range: Record<string, Date> = {};
        if (q.from) range["$gte"] = new Date(q.from);
        if (q.to) range["$lte"] = new Date(q.to);
        filter["sentAt"] = range;
      }
      if (q.cursor) {
        filter["sentAt"] = {
          ...(filter["sentAt"] as Record<string, Date> | undefined),
          $lt: new Date(q.cursor),
        };
      }
      const docs = await deps.mongo.logs
        .find(filter)
        .sort({ sentAt: -1 })
        .limit(q.limit + 1)
        .toArray();
      const items = docs.slice(0, q.limit).map(serialise);
      const nextCursor =
        docs.length > q.limit && items.length > 0
          ? (items[items.length - 1]!["sentAt"] as string | null)
          : null;
      res.json({ items, nextCursor });
    }),
  );

  router.get(
    "/api/admin/notifications/:eventId",
    asyncRoute(async (req, res) => {
      requireAdmin(req);
      const doc = await deps.mongo.logs.findOne({ eventId: req.params["eventId"]! });
      if (!doc) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "Notification not found.",
          status: 404,
        });
      }
      res.json(serialise(doc));
    }),
  );

  router.post(
    "/api/admin/notifications/:eventId/retry",
    asyncRoute(async (req, res) => {
      requireAdmin(req);
      const doc = await deps.mongo.logs.findOne({ eventId: req.params["eventId"]! });
      if (!doc) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "Notification not found.",
          status: 404,
        });
      }
      if (doc.status !== "failed") {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Only failed notifications can be retried.",
          status: 400,
        });
      }
      // Stage 1: mark as queued and let the worker pick it up.
      // The send pipeline retries on next consumer iteration.
      await deps.mongo.logs.updateOne(
        { eventId: doc.eventId },
        {
          $set: { status: "queued" },
          $unset: { failedAt: "", errorMessage: "" },
          $inc: { attempts: 1 },
        },
      );
      res.status(202).json({ status: "queued" });
    }),
  );

  return router;
}

function asyncRoute(
  fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
