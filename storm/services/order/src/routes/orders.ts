import { Router, type RequestHandler } from "express";
import {
  StormError,
  ErrorCodes,
  CreateOrderRequestSchema,
  OrderListQuerySchema,
  CancelOrderRequestSchema,
} from "@storm/contracts";

import { requireAuth } from "../auth/middleware.js";
import type { OrderService } from "../services/orderService.js";
import type { OrderRepo } from "../repositories/orderRepo.js";
import { serialiseOrder, serialiseSummary } from "../services/orderSerializer.js";

export function ordersRouter(deps: {
  service: OrderService;
  repo: OrderRepo;
}): Router {
  const router = Router();
  router.use(requireAuth());

  router.post(
    "/api/orders",
    asyncRoute(async (req, res) => {
      const body = CreateOrderRequestSchema.parse(req.body);
      const idempotencyKey = String(req.header("idempotency-key") ?? "").trim();
      if (!idempotencyKey) {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Idempotency-Key header is required.",
          status: 400,
        });
      }
      const { order, razorpayKeyId } = await deps.service.createOrder({
        userId: req.identity!.userId,
        addressId: body.addressId,
        paymentMethod: body.paymentMethod,
        idempotencyKey,
      });
      res.status(201).json({
        orderId: order.id,
        razorpayOrderId: order.razorpayOrderId,
        amountPaise: order.totalAmountPaise,
        currency: order.currency,
        razorpayKeyId,
      });
    }),
  );

  router.get(
    "/api/orders",
    asyncRoute(async (req, res) => {
      const q = OrderListQuerySchema.parse(req.query);
      const { items, nextCursor } = await deps.repo.listForUser({
        userId: req.identity!.userId,
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
    "/api/orders/:id",
    asyncRoute(async (req, res) => {
      const order = await deps.service.getForUser(req.params.id!, req.identity!.userId);
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

  router.post(
    "/api/orders/:id/cancel",
    asyncRoute(async (req, res) => {
      const body = CancelOrderRequestSchema.parse(req.body ?? {});
      const updated = await deps.service.cancel({
        orderId: req.params.id!,
        actor: { kind: "user", id: req.identity!.userId },
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
