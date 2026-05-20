import type { Logger } from "@storm/logger";

export interface RefreshWorker {
  start(): void;
  stop(): Promise<void>;
}

// Stage 1: ZSET scores are updated on each order event, so periodic refreshes
// don't need to recompute. We use the tick to log staleness and (later) prune
// archived products from per-category sets if accumulated.
export function createRefreshWorker(deps: {
  logger: Logger;
  intervalMs: number;
  name: string;
}): RefreshWorker {
  let timer: NodeJS.Timeout | null = null;
  let stopped = false;

  function scheduleNext() {
    if (stopped) return;
    timer = setTimeout(() => {
      deps.logger.debug({ name: deps.name }, "recs_refresh_tick");
      scheduleNext();
    }, deps.intervalMs);
    timer.unref();
  }

  return {
    start() {
      stopped = false;
      scheduleNext();
      deps.logger.info({ name: deps.name, intervalMs: deps.intervalMs }, "recs_refresh_worker_started");
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
  };
}
