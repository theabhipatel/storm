import { Router } from "express";
import { z } from "zod";

import type { PrismaClient } from "../db.js";
import type { StockService } from "../services/stockService.js";

const SkusQuerySchema = z.object({
  skus: z.string().min(1),
});

const ReservationsByOrderQuerySchema = z.object({
  orderId: z.string().uuid(),
});

// Internal/service-to-service REST endpoint used by cart-service and BFFs to
// check stock availability. gRPC is the primary path; this REST shim avoids
// pulling proto-loader into every consumer.
export function internalRouter(stock: StockService, prisma: PrismaClient): Router {
  const router = Router();

  router.get("/api/internal/stock", async (req, res, next) => {
    try {
      const { skus } = SkusQuerySchema.parse(req.query);
      const list = skus
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const data = await stock.getStock(list);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/internal/reservations", async (req, res, next) => {
    try {
      const { orderId } = ReservationsByOrderQuerySchema.parse(req.query);
      const rows = await prisma.reservation.findMany({
        where: { orderId },
        orderBy: { createdAt: "asc" },
      });
      res.json({
        items: rows.map((r) => ({
          id: r.id,
          sku: r.sku,
          qty: r.qty,
          orderId: r.orderId,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          expiresAt: r.expiresAt.toISOString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
