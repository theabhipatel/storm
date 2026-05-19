import { Router } from "express";
import type { PrismaClient } from "../db.js";

import { brandService } from "../services/brandService.js";
import { categoryService } from "../services/categoryService.js";
import { productService } from "../services/productService.js";

export function publicRouter(prisma: PrismaClient): Router {
  const router = Router();
  const products = productService(prisma);
  const categories = categoryService(prisma);
  const brands = brandService(prisma);

  router.get("/api/products/:slug", async (req, res, next) => {
    try {
      const out = await products.getBySlugPublished(req.params.slug!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/categories", async (_req, res, next) => {
    try {
      const out = await categories.tree();
      res.json({ items: out });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/brands", async (_req, res, next) => {
    try {
      const out = await brands.list();
      res.json({ items: out });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
