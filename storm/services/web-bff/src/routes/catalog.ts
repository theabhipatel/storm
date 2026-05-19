import { Router } from "express";

import type { Config } from "../config.js";
import { catalogClient } from "../services/catalogClient.js";

export function catalogReadRouter(config: Config): Router {
  const router = Router();
  const catalog = catalogClient(config);

  router.get("/api/categories", async (_req, res, next) => {
    try {
      const items = await catalog.fetchCategoryTree();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/brands", async (_req, res, next) => {
    try {
      const items = await catalog.fetchBrands();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
