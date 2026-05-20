import { Router, type RequestHandler } from "express";
import type { Logger } from "@storm/logger";

import { requireAdmin } from "../auth/middleware.js";
import type { Config } from "../config.js";
import { fetchJson, proxyJson } from "../services/proxy.js";

interface OrderDetailUpstream {
  id: string;
  razorpayOrderId: string | null;
  [k: string]: unknown;
}

interface PaymentRecord {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  method: string | null;
  status: string;
  capturedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

interface ReservationsResponse {
  items: Array<{
    id: string;
    sku: string;
    qty: number;
    orderId: string;
    status: string;
    createdAt: string;
    expiresAt: string;
  }>;
}

export function ordersRouter(deps: { config: Config; logger: Logger }): Router {
  const router = Router();
  router.use(requireAdmin());

  router.get(
    "/api/admin/orders",
    asyncRoute(async (req, res) => {
      const query = new URL(req.originalUrl, "http://x").search;
      await proxyJson({
        url: `${deps.config.orderBaseUrl}/api/admin/orders${query}`,
        method: "GET",
        req,
        res,
      });
    }),
  );

  router.get(
    "/api/admin/orders/:id",
    asyncRoute(async (req, res) => {
      const orderRes = await fetchJson<OrderDetailUpstream>({
        url: `${deps.config.orderBaseUrl}/api/admin/orders/${encodeURIComponent(req.params.id!)}`,
        req,
      });
      if (orderRes.status >= 400 || !orderRes.data) {
        res.status(orderRes.status).json(orderRes.data ?? { error: { code: "UPSTREAM_FAILED" } });
        return;
      }
      const order = orderRes.data;

      const paymentPromise: Promise<PaymentRecord | null> = order.razorpayOrderId
        ? fetchJson<PaymentRecord>({
            url: `${deps.config.paymentBaseUrl}/api/internal/payments/by-razorpay-order/${encodeURIComponent(
              order.razorpayOrderId,
            )}`,
            req,
          })
            .then((r) => (r.status === 200 ? r.data : null))
            .catch((err: unknown) => {
              deps.logger.warn({ err, orderId: order.id }, "payment_fetch_failed");
              return null;
            })
        : Promise.resolve(null);

      const reservationsPromise = fetchJson<ReservationsResponse>({
        url: `${deps.config.inventoryBaseUrl}/api/internal/reservations?orderId=${encodeURIComponent(order.id)}`,
        req,
      })
        .then((r) => (r.status === 200 ? r.data?.items ?? [] : []))
        .catch((err: unknown) => {
          deps.logger.warn({ err, orderId: order.id }, "reservations_fetch_failed");
          return [];
        });

      const [payment, reservations] = await Promise.all([paymentPromise, reservationsPromise]);

      res.json({
        ...order,
        payment,
        reservations,
      });
    }),
  );

  router.get(
    "/api/admin/orders/:id/audit",
    asyncRoute(async (req, res) => {
      await proxyJson({
        url: `${deps.config.orderBaseUrl}/api/admin/orders/${encodeURIComponent(req.params.id!)}/audit`,
        method: "GET",
        req,
        res,
      });
    }),
  );

  router.patch(
    "/api/admin/orders/:id/status",
    asyncRoute(async (req, res) => {
      await proxyJson({
        url: `${deps.config.orderBaseUrl}/api/admin/orders/${encodeURIComponent(req.params.id!)}/status`,
        method: "PATCH",
        req,
        res,
      });
    }),
  );

  router.post(
    "/api/admin/orders/:id/cancel",
    asyncRoute(async (req, res) => {
      await proxyJson({
        url: `${deps.config.orderBaseUrl}/api/admin/orders/${encodeURIComponent(req.params.id!)}/cancel`,
        method: "POST",
        req,
        res,
      });
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
