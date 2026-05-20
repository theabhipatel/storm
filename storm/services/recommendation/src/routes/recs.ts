import { Router } from "express";

import type { RecsService } from "../services/recsService.js";

export function recsRouter(svc: RecsService): Router {
  const router = Router();

  router.get("/api/recs/products/:id", async (req, res, next) => {
    try {
      const out = await svc.forProduct(req.params.id!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/recs/categories/:id/top", async (req, res, next) => {
    try {
      const out = await svc.forCategory(req.params.id!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/recs/users/me", async (req, res, next) => {
    try {
      const userId = req.header("x-user-id") ?? "anonymous";
      const out = await svc.forUser(userId);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
