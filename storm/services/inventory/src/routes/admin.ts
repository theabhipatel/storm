import { Router } from "express";
import { StockAdjustmentSchema, StockListQuerySchema } from "@storm/contracts";

import { requireAuth, requireAdmin } from "../auth/middleware.js";
import type { StockService } from "../services/stockService.js";

export function adminRouter(stock: StockService): Router {
  const router = Router();
  const guard = [requireAuth(), requireAdmin()];

  router.get("/api/admin/stock", ...guard, async (req, res, next) => {
    try {
      const query = StockListQuerySchema.parse(req.query);
      const result = await stock.list(query);
      res.json({
        data: result.data,
        page: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
          limit: query.limit,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/admin/stock/:sku", ...guard, async (req, res, next) => {
    try {
      const detail = await stock.detail(req.params.sku!);
      res.json(detail);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/admin/stock/:sku", ...guard, async (req, res, next) => {
    try {
      const body = StockAdjustmentSchema.parse(req.body);
      const updated = await stock.adjust({
        sku: req.params.sku!,
        delta: body.delta,
        reason: body.reason,
        ...(body.lowStockThreshold !== undefined
          ? { lowStockThreshold: body.lowStockThreshold }
          : {}),
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/admin/low-stock-alerts", ...guard, async (_req, res, next) => {
    try {
      const items = await stock.lowStockAlerts();
      res.json({ data: items });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
