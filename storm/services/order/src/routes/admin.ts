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
import { adminTransitionsFor } from "../services/orderService.js";
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
        allowedTransitions: adminTransitionsFor(order.status),
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

  router.get(
    "/api/admin/orders/:id/audit",
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
        orderId: order.id,
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
      const body = AdminOrderUpdateStatusSchema.parse(req.body);
      const updated = await deps.service.transitionStatus({
        orderId: req.params.id!,
        toStatus: body.status as OrderStatus,
        adminUserId: req.identity!.userId,
        ...(body.reason ? { reason: body.reason } : {}),
      });
      res.json(serialiseOrder(updated));
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
