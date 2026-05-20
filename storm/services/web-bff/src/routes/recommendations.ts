import { Router } from "express";

import type { Config } from "../config.js";
import { proxyJson } from "../services/proxy.js";

export function recommendationsRouter(config: Config): Router {
  const router = Router();

  router.get("/api/recs/products/:id", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.recommendationBaseUrl}/api/recs/products/${encodeURIComponent(req.params.id!)}`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/recs/users/me", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.recommendationBaseUrl}/api/recs/users/me`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/recs/categories/:id/top", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.recommendationBaseUrl}/api/recs/categories/${encodeURIComponent(req.params.id!)}/top`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
