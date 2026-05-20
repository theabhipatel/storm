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

  // Internal batch lookup used by cart/wishlist services to refresh prices
  // and metadata. Accepts comma-separated `skus` or `ids` query params.
  router.get("/api/internal/products", async (req, res, next) => {
    try {
      const skusParam = typeof req.query["skus"] === "string" ? req.query["skus"] : "";
      const idsParam = typeof req.query["ids"] === "string" ? req.query["ids"] : "";
      const skus = skusParam.split(",").map((s) => s.trim()).filter(Boolean);
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      const [bySku, byId] = await Promise.all([
        products.lookupBySkus(skus),
        products.lookupByIds(ids),
      ]);
      const merged = new Map<string, (typeof bySku)[number]>();
      for (const r of bySku) merged.set(r.id, r);
      for (const r of byId) merged.set(r.id, r);
      res.json({ data: Array.from(merged.values()) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
