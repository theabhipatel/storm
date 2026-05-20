import type { Logger } from "@storm/logger";
import { InventoryEventTypes } from "@storm/contracts";

import type { PrismaClient, StockItem } from "../db.js";
import { appendOutbox } from "../outbox/writer.js";

export interface LowStockWorker {
  start(): void;
  stop(): Promise<void>;
  runOnce(): Promise<number>;
}

export function createLowStockWorker(deps: {
  prisma: PrismaClient;
  logger: Logger;
  intervalMs: number;
}): LowStockWorker {
  let timer: NodeJS.Timeout | null = null;
  let stopped = false;
  let inflight = false;

  async function runOnce(): Promise<number> {
    if (inflight) return 0;
    inflight = true;
    try {
      const rows = await deps.prisma.$queryRaw<StockItem[]>`
        SELECT * FROM stock_items
        WHERE (quantity_on_hand - quantity_reserved) <= low_stock_threshold
        LIMIT 200
      `;
      if (rows.length === 0) return 0;
      await deps.prisma.$transaction(async (tx) => {
        for (const r of rows) {
          await appendOutbox(tx, {
            aggregateId: r.sku,
            eventType: InventoryEventTypes.LowStock,
            payload: {
              sku: r.sku,
              productId: r.productId,
              quantityOnHand: r.quantityOnHand,
              threshold: r.lowStockThreshold,
            },
          });
        }
      });
      deps.logger.info({ count: rows.length }, "low_stock_alerts_emitted");
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
        deps.logger.error({ err }, "low_stock_tick_failed");
      }
      scheduleNext();
    }, deps.intervalMs);
    timer.unref();
  }

  return {
    start() {
      stopped = false;
      scheduleNext();
      deps.logger.info({ intervalMs: deps.intervalMs }, "low_stock_worker_started");
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      while (inflight) await new Promise((r) => setTimeout(r, 50));
    },
    runOnce,
  };
}
