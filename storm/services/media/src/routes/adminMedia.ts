import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireAdmin } from "../auth/middleware.js";
import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";
import { mediaService } from "../services/mediaService.js";

const PatchSchema = z.object({
  altText: z.string().max(200).nullable(),
});

export function adminMediaRouter(prisma: PrismaClient, config: Config): Router {
  const router = Router();
  const svc = mediaService(prisma, config);
  const guard = [requireAuth(), requireAdmin()];

  router.patch("/api/media/:id", ...guard, async (req, res, next) => {
    try {
      const body = PatchSchema.parse(req.body);
      const out = await svc.updateAltText(req.params.id!, body.altText);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
