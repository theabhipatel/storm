import { Router } from "express";
import { WishlistAddItemSchema } from "@storm/contracts";

import { requireAuth } from "../auth/middleware.js";
import type { WishlistService } from "../services/wishlistService.js";

export function wishlistRouter(svc: WishlistService): Router {
  const router = Router();
  router.use(requireAuth());

  router.get("/api/wishlist", async (req, res, next) => {
    try {
      const out = await svc.get(req.identity!.userId);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/wishlist/items", async (req, res, next) => {
    try {
      const body = WishlistAddItemSchema.parse(req.body);
      const out = await svc.add(req.identity!.userId, body.sku);
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/wishlist/items/:sku", async (req, res, next) => {
    try {
      const out = await svc.remove(req.identity!.userId, req.params.sku!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/wishlist/items/:sku/move-to-cart", async (req, res, next) => {
    try {
      const out = await svc.moveToCart(req.identity!.userId, req.params.sku!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
