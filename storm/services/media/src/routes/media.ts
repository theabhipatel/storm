import { Router } from "express";
import { StormError, ErrorCodes } from "@storm/contracts";

import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";
import { publicUrlFor } from "../infra/s3.js";
import { mediaService } from "../services/mediaService.js";

export function mediaRouter(prisma: PrismaClient, config: Config): Router {
  const router = Router();
  const svc = mediaService(prisma, config);

  router.get("/api/media/:id", async (req, res, next) => {
    try {
      const out = await svc.get(req.params.id!);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  // Batch lookup — used by web-bff to resolve a product's media in one round trip.
  router.get("/api/media", async (req, res, next) => {
    try {
      const ids = (req.query["ids"] ?? "").toString().split(",").filter(Boolean);
      if (ids.length === 0) {
        res.json({ items: [] });
        return;
      }
      if (ids.length > 100) {
        throw new StormError({
          code: ErrorCodes.BAD_REQUEST,
          message: "Maximum 100 ids per request.",
          status: 400,
        });
      }
      const out = await svc.getMany(ids);
      res.json({ items: out });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/media/:id/raw", async (req, res, next) => {
    try {
      const asset = await prisma.mediaAsset.findUnique({
        where: { id: req.params.id! },
      });
      if (!asset) {
        throw new StormError({
          code: ErrorCodes.NOT_FOUND,
          message: "Media asset not found.",
          status: 404,
        });
      }
      res.redirect(302, publicUrlFor(config, asset.s3Key));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
