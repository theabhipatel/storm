import { Router } from "express";
import type { PrismaClient } from "../db.js";
import { BrandCreateSchema, BrandUpdateSchema } from "@storm/contracts";

import { requireAuth, requireAdmin } from "../auth/middleware.js";
import { brandService } from "../services/brandService.js";

export function adminBrandsRouter(prisma: PrismaClient): Router {
  const router = Router();
  const svc = brandService(prisma);
  const guard = [requireAuth(), requireAdmin()];

  router.post("/api/admin/brands", ...guard, async (req, res, next) => {
    try {
      const body = BrandCreateSchema.parse(req.body);
      const out = await svc.create(body);
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/admin/brands/:id", ...guard, async (req, res, next) => {
    try {
      const body = BrandUpdateSchema.parse(req.body);
      const out = await svc.update(req.params.id!, body);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/admin/brands/:id", ...guard, async (req, res, next) => {
    try {
      await svc.remove(req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
