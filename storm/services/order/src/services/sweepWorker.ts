import type { Logger } from "@storm/logger";

import type { OrderService } from "./orderService.js";

export interface SweepWorker {
  start(): void;
  stop(): Promise<void>;
}

export function createSweepWorker(deps: {
  service: OrderService;
  logger: Logger;
  intervalMs: number;
}): SweepWorker {
  let timer: NodeJS.Timeout | null = null;
  let inflight = false;
  let stopped = false;

  function scheduleNext(): void {
    if (stopped) return;
    timer = setTimeout(async () => {
      if (inflight) return scheduleNext();
      inflight = true;
      try {
        await deps.service.expireStalePending();
      } catch (err) {
        deps.logger.error({ err }, "ttl_sweep_failed");
      } finally {
        inflight = false;
      }
      scheduleNext();
    }, deps.intervalMs);
    timer.unref();
  }

  return {
    start() {
      stopped = false;
      scheduleNext();
      deps.logger.info({ intervalMs: deps.intervalMs }, "order_sweep_worker_started");
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      while (inflight) await new Promise((r) => setTimeout(r, 50));
    },
  };
}
