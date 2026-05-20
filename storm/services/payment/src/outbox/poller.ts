import type { Logger } from "@storm/logger";

import type { PrismaClient } from "../db.js";
import { parseEventVersion, type OutboxProducer } from "./producer.js";

export interface PollerOptions {
  prisma: PrismaClient;
  producer: OutboxProducer;
  logger: Logger;
  producerName: string;
  intervalMs?: number;
  batchSize?: number;
}

export interface OutboxPoller {
  start(): void;
  stop(): Promise<void>;
  runOnce(): Promise<number>;
}

export function createOutboxPoller(opts: PollerOptions): OutboxPoller {
  const intervalMs = opts.intervalMs ?? 1000;
  const batchSize = opts.batchSize ?? 50;
  let timer: NodeJS.Timeout | null = null;
  let inflight = false;
  let stopped = false;

  async function runOnce(): Promise<number> {
    if (inflight) return 0;
    inflight = true;
    try {
      const rows = await opts.prisma.outbox.findMany({
        where: { publishedAt: null },
        orderBy: { createdAt: "asc" },
        take: batchSize,
      });
      if (rows.length === 0) return 0;

      let published = 0;
      for (const row of rows) {
        try {
          await opts.producer.send({
            topic: row.eventType,
            key: row.aggregateId,
            envelope: {
              eventId: row.id,
              eventType: row.eventType,
              eventVersion: parseEventVersion(row.eventType),
              occurredAt: row.createdAt.toISOString(),
              producer: opts.producerName,
              payload: row.payload as unknown,
            },
          });
          await opts.prisma.outbox.update({
            where: { id: row.id },
            data: { publishedAt: new Date() },
          });
          published += 1;
        } catch (err) {
          opts.logger.error(
            { err, eventId: row.id, eventType: row.eventType },
            "outbox_publish_failed",
          );
          break;
        }
      }
      if (published > 0) {
        opts.logger.debug({ published }, "outbox_batch_published");
      }
      return published;
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
        opts.logger.error({ err }, "outbox_poller_tick_failed");
      }
      scheduleNext();
    }, intervalMs);
    timer.unref();
  }

  return {
    start() {
      stopped = false;
      scheduleNext();
      opts.logger.info({ intervalMs }, "outbox_poller_started");
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      while (inflight) await new Promise((r) => setTimeout(r, 50));
    },
    runOnce,
  };
}
