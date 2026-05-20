import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { MongoState } from "../infra/mongo.js";

const ListQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export function notificationsRouter(deps: { mongo: MongoState }): Router {
  const router = Router();

  router.get(
    "/api/me/notifications",
    asyncRoute(async (req, res) => {
      const userId = req.header("x-user-id");
      if (!userId) {
        throw new StormError({
          code: ErrorCodes.UNAUTHENTICATED,
          message: "x-user-id header missing.",
          status: 401,
        });
      }
      const q = ListQuerySchema.parse(req.query);
      const filter: Record<string, unknown> = { userId };
      if (q.cursor) {
        filter["sentAt"] = { $lt: new Date(q.cursor) };
      }
      const docs = await deps.mongo.logs
        .find(filter)
        .sort({ sentAt: -1 })
        .limit(q.limit + 1)
        .toArray();
      const items = docs.slice(0, q.limit).map((d) => ({
        eventId: d.eventId,
        channel: d.channel,
        templateId: d.templateId,
        status: d.status,
        payload: d.payload,
        sentAt: d.sentAt?.toISOString() ?? null,
        failedAt: d.failedAt?.toISOString() ?? null,
      }));
      const nextCursor =
        docs.length > q.limit && items.length > 0
          ? items[items.length - 1]!.sentAt
          : null;
      res.json({ items, nextCursor });
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
