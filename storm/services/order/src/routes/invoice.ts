import { Router, type RequestHandler } from "express";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { Config } from "../config.js";
import { requireAuth } from "../auth/middleware.js";
import type { OrderService } from "../services/orderService.js";

export function invoiceRouter(deps: {
  service: OrderService;
  notificationBaseUrl: string;
}): Router {
  const router = Router();
  router.use(requireAuth());

  router.get(
    "/api/orders/:id/invoice",
    asyncRoute(async (req, res) => {
      const order = await deps.service.getForUser(req.params.id!, req.identity!.userId);
      if (order.status !== "confirmed" && order.status !== "processing" && order.status !== "shipped" && order.status !== "delivered") {
        throw new StormError({
          code: ErrorCodes.CONFLICT,
          message: "Invoice is only available after the order is confirmed.",
          status: 409,
        });
      }
      // notification-service owns invoice storage; proxy the download.
      const upstream = await fetch(
        `${deps.notificationBaseUrl}/api/internal/invoices/${order.id}.pdf`,
      );
      if (!upstream.ok) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "Invoice not yet available.",
          status: 404,
        });
      }
      res.setHeader("content-type", "application/pdf");
      res.setHeader(
        "content-disposition",
        `attachment; filename="invoice-${order.id}.pdf"`,
      );
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.status(200).send(buf);
    }),
  );

  return router;
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

// Re-export for typing in server.ts; not actually used here.
export type { Config };
