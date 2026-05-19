import { Router } from "express";
import type { PrismaClient } from "../db.js";
import { CategoryCreateSchema, CategoryUpdateSchema } from "@storm/contracts";

import { requireAuth, requireAdmin } from "../auth/middleware.js";
import { categoryService } from "../services/categoryService.js";

export function adminCategoriesRouter(prisma: PrismaClient): Router {
  const router = Router();
  const svc = categoryService(prisma);
  const guard = [requireAuth(), requireAdmin()];

  router.post("/api/admin/categories", ...guard, async (req, res, next) => {
    try {
      const body = CategoryCreateSchema.parse(req.body);
      const out = await svc.create(body);
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/admin/categories/:id", ...guard, async (req, res, next) => {
    try {
      const body = CategoryUpdateSchema.parse(req.body);
      const out = await svc.update(req.params.id!, body);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/admin/categories/:id", ...guard, async (req, res, next) => {
    try {
      await svc.remove(req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
