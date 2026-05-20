import { Router } from "express";

import type { Config } from "../config.js";
import { proxyJson } from "../services/proxy.js";

export function cartRouter(config: Config): Router {
  const router = Router();

  router.get("/api/cart", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.cartBaseUrl}/api/cart`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/cart/items", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.cartBaseUrl}/api/cart/items`,
        method: "POST",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/cart/items/:sku", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.cartBaseUrl}/api/cart/items/${encodeURIComponent(req.params.sku!)}`,
        method: "PATCH",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/cart/items/:sku", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.cartBaseUrl}/api/cart/items/${encodeURIComponent(req.params.sku!)}`,
        method: "DELETE",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/cart", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.cartBaseUrl}/api/cart`,
        method: "DELETE",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/cart/merge", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.cartBaseUrl}/api/cart/merge`,
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
