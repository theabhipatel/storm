import { Router } from "express";
import { z } from "zod";

import type { StockService } from "../services/stockService.js";

const SkusQuerySchema = z.object({
  skus: z.string().min(1),
});

// Internal/service-to-service REST endpoint used by cart-service and BFFs to
// check stock availability. gRPC is the primary path; this REST shim avoids
// pulling proto-loader into every consumer.
export function internalRouter(stock: StockService): Router {
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

  return router;
}
