import { Router, type RequestHandler } from "express";
import {
  StormError,
  ErrorCodes,
  AdminOrderListQuerySchema,
  AdminOrderUpdateStatusSchema,
  CancelOrderRequestSchema,
} from "@storm/contracts";

import { requireAdmin } from "../auth/middleware.js";
import type { OrderService } from "../services/orderService.js";
import type { OrderRepo } from "../repositories/orderRepo.js";
import { serialiseOrder, serialiseSummary } from "../services/orderSerializer.js";
import type { OrderStatus, PrismaClient } from "../db.js";

export function adminRouter(deps: {
  service: OrderService;
  repo: OrderRepo;
  prisma: PrismaClient;
}): Router {
  const router = Router();
  router.use(requireAdmin());

  router.get(
    "/api/admin/orders",
    asyncRoute(async (req, res) => {
      const q = AdminOrderListQuerySchema.parse(req.query);
      const { items, nextCursor } = await deps.repo.listForAdmin({
        ...(q.status ? { status: q.status as OrderStatus } : {}),
        ...(q.q ? { q: q.q } : {}),
        ...(q.customerId ? { customerId: q.customerId } : {}),
        ...(q.from ? { from: new Date(q.from) } : {}),
        ...(q.to ? { to: new Date(q.to) } : {}),
        ...(q.cursor ? { cursor: q.cursor } : {}),
        limit: q.limit,
      });
      res.json({
        items: items.map(serialiseSummary),
        nextCursor,
      });
    }),
  );

  router.get(
    "/api/admin/orders/:id",
    asyncRoute(async (req, res) => {
      const order = await deps.repo.findById(req.params.id!);
      if (!order) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "Order not found.",
          status: 404,
        });
      }
      const history = await deps.repo.history(order.id);
      res.json({
        ...serialiseOrder(order),
        history: history.map((h) => ({
          id: h.id,
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          changedBy: h.changedBy,
          reason: h.reason,
          changedAt: h.changedAt.toISOString(),
        })),
      });
    }),
  );

  router.patch(
    "/api/admin/orders/:id/status",
    asyncRoute(async (req, res) => {
      // Day 8 will broaden this. Today we only allow admin to push from
      // confirmed → processing; full state machine wiring lands tomorrow.
      const body = AdminOrderUpdateStatusSchema.parse(req.body);
      const order = await deps.repo.findById(req.params.id!);
      if (!order) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "Order not found.",
          status: 404,
        });
      }
      if (order.status !== "confirmed" || body.status !== "processing") {
        throw new StormError({
          code: ErrorCodes.INVALID_STATE_TRANSITION,
          message: `Cannot transition ${order.status} → ${body.status} (Day 8 will expand this).`,
          status: 409,
        });
      }
      const updated = await deps.prisma.$transaction(async (tx) => {
        const next = await deps.repo.applyTransition(tx, {
          orderId: order.id,
          toStatus: "processing",
        });
        await deps.repo.recordTransition(tx, {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "processing",
          changedBy: req.identity!.userId,
          reason: body.reason ?? "admin_transition",
        });
        return next;
      });
      const full = await deps.repo.findById(updated.id);
      res.json(serialiseOrder(full!));
    }),
  );

  router.post(
    "/api/admin/orders/:id/cancel",
    asyncRoute(async (req, res) => {
      const body = CancelOrderRequestSchema.parse(req.body ?? {});
      const updated = await deps.service.cancel({
        orderId: req.params.id!,
        actor: { kind: "admin", id: req.identity!.userId },
        ...(body.reason ? { reason: body.reason } : {}),
      });
      res.json(serialiseOrder(updated));
    }),
  );

  return router;
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
