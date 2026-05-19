import { Router } from "express";

import type { searchService } from "../services/searchService.js";

export function searchRouter(svc: ReturnType<typeof searchService>): Router {
  const router = Router();

  router.get("/search", async (req, res, next) => {
    try {
      const out = await svc.search(req.query);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/autocomplete", async (req, res, next) => {
    try {
      const q = (req.query["q"] as string | undefined) ?? "";
      const out = await svc.autocomplete(q);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/facets", async (req, res, next) => {
    try {
      const out = await svc.facets(req.query);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
