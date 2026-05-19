import type { S3Client } from "@aws-sdk/client-s3";
import type { Logger } from "@storm/logger";

import type { Config } from "../config.js";
import type { PrismaClient } from "../db.js";
import { deleteObject } from "../infra/s3.js";

const ONE_HOUR_MS = 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// Run hourly — cheaper than every-second polling for sweeps.
const TICK_MS = 60 * 60 * 1000;

export interface CleanupDeps {
  prisma: PrismaClient;
  s3: S3Client;
  config: Config;
  logger: Logger;
  // catalog-service exposes "is mediaId referenced?" — for Stage 1 we have no
  // cross-service contract for that yet, so the orphan sweep is no-op by default.
  isOrphan?: (mediaId: string) => Promise<boolean>;
}

export interface CleanupWorker {
  start(): void;
  stop(): Promise<void>;
  runOnce(): Promise<{ pendingDeleted: number; orphansDeleted: number }>;
}

export function createCleanupWorker(deps: CleanupDeps): CleanupWorker {
  const { prisma, s3, config, logger, isOrphan } = deps;
  let timer: NodeJS.Timeout | null = null;
  let stopped = false;

  async function sweepPending(): Promise<number> {
    const cutoff = new Date(Date.now() - ONE_HOUR_MS);
    const stale = await prisma.mediaAsset.findMany({
      where: { status: "pending", createdAt: { lt: cutoff } },
    });
    for (const a of stale) {
      await deleteObject(s3, config, a.s3Key).catch((err) => {
        logger.warn({ err, key: a.s3Key }, "s3_delete_failed");
      });
      await prisma.mediaAsset.delete({ where: { id: a.id } });
    }
    return stale.length;
  }

  async function sweepOrphans(): Promise<number> {
    if (!isOrphan) return 0;
    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);
    const candidates = await prisma.mediaAsset.findMany({
      where: { status: "ready", createdAt: { lt: cutoff } },
      include: { thumbnails: true },
      take: 100,
    });
    let removed = 0;
    for (const asset of candidates) {
      const orphan = await isOrphan(asset.id);
      if (!orphan) continue;
      for (const t of asset.thumbnails) {
        await deleteObject(s3, config, t.s3Key).catch(() => undefined);
      }
      await deleteObject(s3, config, asset.s3Key).catch(() => undefined);
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      removed += 1;
    }
    return removed;
  }

  async function runOnce() {
    const pendingDeleted = await sweepPending().catch((err) => {
      logger.error({ err }, "sweep_pending_failed");
      return 0;
    });
    const orphansDeleted = await sweepOrphans().catch((err) => {
      logger.error({ err }, "sweep_orphans_failed");
      return 0;
    });
    if (pendingDeleted > 0 || orphansDeleted > 0) {
      logger.info({ pendingDeleted, orphansDeleted }, "cleanup_run");
    }
    return { pendingDeleted, orphansDeleted };
  }

  function scheduleNext(): void {
    if (stopped) return;
    timer = setTimeout(async () => {
      await runOnce().catch(() => undefined);
      scheduleNext();
    }, TICK_MS);
    timer.unref();
  }

  return {
    start() {
      stopped = false;
      scheduleNext();
      logger.info({ tickMs: TICK_MS }, "cleanup_worker_started");
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
    runOnce,
  };
}
