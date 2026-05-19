import { Router } from "express";
import type { PrismaClient } from "../db.js";
import {
  AdminProductListQuerySchema,
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductMediaAttachSchema,
  VariantCreateSchema,
  VariantUpdateSchema,
} from "@storm/contracts";

import { requireAuth, requireAdmin } from "../auth/middleware.js";
import { lifecycleService } from "../services/lifecycleService.js";
import { productService } from "../services/productService.js";

export function adminProductsRouter(prisma: PrismaClient): Router {
  const router = Router();
  const svc = productService(prisma);
  const life = lifecycleService(prisma);
  const guard = [requireAuth(), requireAdmin()];

  router.get("/api/admin/products", ...guard, async (req, res, next) => {
    try {
      const filters = AdminProductListQuerySchema.parse(req.query);
      const out = await svc.list(filters);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/admin/products/:id", ...guard, async (req, res, next) => {
    try {
      const out = await svc.getById(req.params.id!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/admin/products", ...guard, async (req, res, next) => {
    try {
      const body = ProductCreateSchema.parse(req.body);
      const out = await svc.create(body);
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/admin/products/:id", ...guard, async (req, res, next) => {
    try {
      const body = ProductUpdateSchema.parse(req.body);
      const out = await svc.update(req.params.id!, body);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  // Lifecycle ---
  router.post("/api/admin/products/:id/publish", ...guard, async (req, res, next) => {
    try {
      const out = await life.publish(req.params.id!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/admin/products/:id/archive", ...guard, async (req, res, next) => {
    try {
      const out = await life.archive(req.params.id!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/admin/products/:id/restore", ...guard, async (req, res, next) => {
    try {
      const out = await life.restore(req.params.id!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  // Variants ---
  router.post("/api/admin/products/:id/variants", ...guard, async (req, res, next) => {
    try {
      const body = VariantCreateSchema.parse(req.body);
      const out = await svc.addVariant(req.params.id!, body);
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

  router.patch(
    "/api/admin/products/:id/variants/:variantId",
    ...guard,
    async (req, res, next) => {
      try {
        const body = VariantUpdateSchema.parse(req.body);
        const out = await svc.updateVariant(req.params.id!, req.params.variantId!, body);
        res.json(out);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    "/api/admin/products/:id/variants/:variantId",
    ...guard,
    async (req, res, next) => {
      try {
        await svc.removeVariant(req.params.id!, req.params.variantId!);
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  );

  // Media ---
  router.post("/api/admin/products/:id/media", ...guard, async (req, res, next) => {
    try {
      const body = ProductMediaAttachSchema.parse(req.body);
      await svc.attachMedia(req.params.id!, body);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  router.delete(
    "/api/admin/products/:id/media/:mediaId",
    ...guard,
    async (req, res, next) => {
      try {
        await svc.detachMedia(req.params.id!, req.params.mediaId!);
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
