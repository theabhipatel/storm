import { Router } from "express";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { reindexService } from "../services/reindexService.js";

export function adminRouter(svc: ReturnType<typeof reindexService>): Router {
  const router = Router();

  router.post("/admin/reindex", async (req, res, next) => {
    try {
      if (!req.auth?.roles?.includes("admin")) {
        throw new StormError({
          code: ErrorCodes.FORBIDDEN,
          message: "Admin role required.",
          status: 403,
        });
      }
      const out = await svc.run();
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
