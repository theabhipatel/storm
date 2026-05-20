import { Router } from "express";

import type { Config } from "../config.js";
import { proxyJson } from "../services/proxy.js";

export function wishlistRouter(config: Config): Router {
  const router = Router();

  router.get("/api/wishlist", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.wishlistBaseUrl}/api/wishlist`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/wishlist/items", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.wishlistBaseUrl}/api/wishlist/items`,
        method: "POST",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/wishlist/items/:sku", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.wishlistBaseUrl}/api/wishlist/items/${encodeURIComponent(req.params.sku!)}`,
        method: "DELETE",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/wishlist/items/:sku/move-to-cart", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.wishlistBaseUrl}/api/wishlist/items/${encodeURIComponent(req.params.sku!)}/move-to-cart`,
        method: "POST",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
