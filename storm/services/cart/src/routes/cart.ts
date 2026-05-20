import { Router } from "express";
import {
  CartAddItemSchema,
  CartUpdateItemSchema,
  CartMergeSchema,
} from "@storm/contracts";

import { requireAuth } from "../auth/middleware.js";
import type { CartService } from "../services/cartService.js";

export function cartRouter(svc: CartService): Router {
  const router = Router();
  router.use(requireAuth());

  router.get("/api/cart", async (req, res, next) => {
    try {
      const cart = await svc.get(req.identity!.userId);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/cart/items", async (req, res, next) => {
    try {
      const body = CartAddItemSchema.parse(req.body);
      const cart = await svc.addItem(req.identity!.userId, body);
      res.status(201).json(cart);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/api/cart/items/:sku", async (req, res, next) => {
    try {
      const body = CartUpdateItemSchema.parse(req.body);
      const cart = await svc.updateItem(req.identity!.userId, req.params.sku!, body.qty);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/cart/items/:sku", async (req, res, next) => {
    try {
      const cart = await svc.removeItem(req.identity!.userId, req.params.sku!);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/api/cart", async (req, res, next) => {
    try {
      const cart = await svc.clear(req.identity!.userId);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/cart/merge", async (req, res, next) => {
    try {
      const body = CartMergeSchema.parse(req.body);
      const cart = await svc.merge(req.identity!.userId, body);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
