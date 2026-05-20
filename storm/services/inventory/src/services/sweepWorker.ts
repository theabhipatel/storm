import type { Logger } from "@storm/logger";
import { InventoryEventTypes } from "@storm/contracts";

import type { PrismaClient } from "../db.js";
import { appendOutbox } from "../outbox/writer.js";

export interface SweepWorker {
  start(): void;
  stop(): Promise<void>;
  runOnce(): Promise<number>;
}

export function createSweepWorker(deps: {
  prisma: PrismaClient;
  logger: Logger;
  intervalMs: number;
}): SweepWorker {
  let timer: NodeJS.Timeout | null = null;
  let stopped = false;
  let inflight = false;

  async function runOnce(): Promise<number> {
    if (inflight) return 0;
    inflight = true;
    try {
      const expired = await deps.prisma.reservation.findMany({
        where: { status: "active", expiresAt: { lt: new Date() } },
        take: 100,
      });
      if (expired.length === 0) return 0;
      const byOrder = new Map<string, typeof expired>();
      for (const r of expired) {
        const arr = byOrder.get(r.orderId) ?? [];
        arr.push(r);
        byOrder.set(r.orderId, arr);
      }
      let released = 0;
      for (const [orderId, rows] of byOrder.entries()) {
        await deps.prisma.$transaction(async (tx) => {
          for (const r of rows) {
            const refreshed = await tx.reservation.findUnique({ where: { id: r.id } });
            if (!refreshed || refreshed.status !== "active") continue;
            await tx.stockItem.update({
              where: { sku: r.sku },
              data: {
                quantityReserved: { decrement: r.qty },
                version: { increment: 1 },
              },
            });
            await tx.reservation.update({
              where: { id: r.id },
              data: { status: "released" },
            });
            released += 1;
          }
          await appendOutbox(tx, {
            aggregateId: orderId,
            eventType: InventoryEventTypes.Released,
            payload: { reservationId: rows[0]!.id, reason: "expired" },
          });
        });
      }
      if (released > 0) {
        deps.logger.info({ released, orders: byOrder.size }, "reservation_sweep_released");
      }
      return released;
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
        deps.logger.error({ err }, "sweep_tick_failed");
      }
      scheduleNext();
    }, deps.intervalMs);
    timer.unref();
  }

  return {
    start() {
      stopped = false;
      scheduleNext();
      deps.logger.info({ intervalMs: deps.intervalMs }, "reservation_sweep_started");
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      while (inflight) await new Promise((r) => setTimeout(r, 50));
    },
    runOnce,
  };
}
