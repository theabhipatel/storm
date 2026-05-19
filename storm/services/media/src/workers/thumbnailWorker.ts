import type { S3Client } from "@aws-sdk/client-s3";
import { MediaEventTypes, type ThumbnailVariant } from "@storm/contracts";
import type { Logger } from "@storm/logger";
import sharp from "sharp";
import { uuidv7 } from "uuidv7";

import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";
import { downloadObject, uploadObject } from "../infra/s3.js";
import { appendOutbox } from "../outbox/writer.js";

const VARIANTS: { variant: ThumbnailVariant; size: number }[] = [
  { variant: "sm", size: 200 },
  { variant: "md", size: 600 },
  { variant: "lg", size: 1200 },
];

export interface ThumbnailWorkerDeps {
  prisma: PrismaClient;
  s3: S3Client;
  config: Config;
  logger: Logger;
}

export interface ThumbnailWorker {
  start(): void;
  stop(): Promise<void>;
  runOnce(): Promise<number>;
}

// Local-dev replacement for S3 ObjectCreated → SQS: poll for `confirmed`
// MediaAssets, generate thumbnails, and mark them `ready`.
export function createThumbnailWorker(deps: ThumbnailWorkerDeps): ThumbnailWorker {
  const { prisma, s3, config, logger } = deps;
  let timer: NodeJS.Timeout | null = null;
  let inflight = false;
  let stopped = false;

  async function processOne(mediaId: string): Promise<void> {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
    if (!asset) return;
    if (asset.status !== "confirmed" && asset.status !== "failed") return;

    let original: Buffer;
    try {
      original = await downloadObject(s3, config, asset.s3Key);
    } catch (err) {
      await onFailure(mediaId, asset.retryCount, "download_failed", err);
      return;
    }

    let meta: sharp.Metadata;
    try {
      meta = await sharp(original).metadata();
    } catch (err) {
      await onFailure(mediaId, asset.retryCount, "metadata_failed", err);
      return;
    }

    const thumbsToWrite: {
      variant: ThumbnailVariant;
      key: string;
      width: number;
      height: number;
    }[] = [];

    try {
      for (const { variant, size } of VARIANTS) {
        const key = `thumbs/${mediaId}/${variant}.webp`;
        const buf = await sharp(original)
          .resize(size, size, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer({ resolveWithObject: true });
        await uploadObject(s3, config, {
          key,
          body: buf.data,
          contentType: "image/webp",
        });
        thumbsToWrite.push({
          variant,
          key,
          width: buf.info.width,
          height: buf.info.height,
        });
      }
    } catch (err) {
      await onFailure(mediaId, asset.retryCount, "thumbnail_failed", err);
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.thumbnail.deleteMany({ where: { mediaAssetId: mediaId } });
      for (const t of thumbsToWrite) {
        await tx.thumbnail.create({
          data: {
            id: uuidv7(),
            mediaAssetId: mediaId,
            variant: t.variant,
            s3Key: t.key,
            width: t.width,
            height: t.height,
          },
        });
      }
      await tx.mediaAsset.update({
        where: { id: mediaId },
        data: {
          status: "ready",
          readyAt: new Date(),
          width: meta.width ?? null,
          height: meta.height ?? null,
          failureReason: null,
        },
      });
      await appendOutbox(tx, {
        aggregateId: mediaId,
        eventType: MediaEventTypes.MediaProcessingComplete,
        payload: {
          mediaId,
          contentType: asset.contentType,
          width: meta.width ?? null,
          height: meta.height ?? null,
          variants: thumbsToWrite.map((t) => ({
            variant: t.variant,
            width: t.width,
            height: t.height,
          })),
        },
      });
    });
    logger.info({ mediaId, variants: thumbsToWrite.length }, "thumbnail_ready");
  }

  async function onFailure(
    mediaId: string,
    retryCount: number,
    reason: string,
    err: unknown,
  ): Promise<void> {
    const nextRetry = retryCount + 1;
    const giveUp = nextRetry > config.thumbnailMaxRetries;
    logger.error({ err, mediaId, reason, nextRetry, giveUp }, "thumbnail_failure");
    if (giveUp) {
      await prisma.$transaction(async (tx) => {
        await tx.mediaAsset.update({
          where: { id: mediaId },
          data: {
            status: "failed",
            failureReason: reason,
            retryCount: nextRetry,
          },
        });
        await appendOutbox(tx, {
          aggregateId: mediaId,
          eventType: MediaEventTypes.MediaProcessingFailed,
          payload: { mediaId, reason },
        });
      });
    } else {
      // Stay in "confirmed" so the worker retries on the next tick.
      await prisma.mediaAsset.update({
        where: { id: mediaId },
        data: { retryCount: nextRetry, failureReason: reason },
      });
    }
  }

  async function runOnce(): Promise<number> {
    if (inflight) return 0;
    inflight = true;
    try {
      const rows = await prisma.mediaAsset.findMany({
        where: { status: "confirmed" },
        orderBy: { confirmedAt: "asc" },
        take: 10,
      });
      for (const row of rows) {
        await processOne(row.id);
      }
      return rows.length;
    } finally {
      inflight = false;
    }
  }

  function scheduleNext(): void {
    if (stopped) return;
    timer = setTimeout(async () => {
      try {
        await runOnce();
      } catch (err) {
        logger.error({ err }, "thumbnail_worker_tick_failed");
      }
      scheduleNext();
    }, config.thumbnailWorkerIntervalMs);
    timer.unref();
  }

  return {
    start() {
      stopped = false;
      scheduleNext();
      logger.info(
        { intervalMs: config.thumbnailWorkerIntervalMs },
        "thumbnail_worker_started",
      );
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      while (inflight) await new Promise((r) => setTimeout(r, 50));
    },
    runOnce,
  };
}
