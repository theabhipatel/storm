import type { S3Client } from "@aws-sdk/client-s3";
import { Router } from "express";
import { UploadRequestSchema } from "@storm/contracts";

import { requireAuth, requireAdmin } from "../auth/middleware.js";
import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";
import { uploadService } from "../services/uploadService.js";

export function uploadsRouter(
  prisma: PrismaClient,
  s3: S3Client,
  config: Config,
): Router {
  const router = Router();
  const svc = uploadService(prisma, s3, config);
  const guard = [requireAuth(), requireAdmin()];

  router.post("/api/uploads", ...guard, async (req, res, next) => {
    try {
      const body = UploadRequestSchema.parse(req.body);
      const result = await svc.requestUpload({
        contentType: body.contentType,
        sizeBytes: body.sizeBytes,
        altText: body.altText,
        uploadedBy: req.identity!.userId,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/uploads/:mediaId/confirm", ...guard, async (req, res, next) => {
    try {
      await svc.confirmUpload(req.params.mediaId!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
