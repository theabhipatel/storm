import "./tracing.js";

import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { disconnectRedis, getRedis } from "./infra/redis.js";
import { catalogClient } from "./services/catalogClient.js";
import { inventoryClient } from "./services/inventoryClient.js";
import { recsRepo } from "./repositories/recsRepo.js";
import { recsService } from "./services/recsService.js";
import { createRefreshWorker } from "./services/refreshWorker.js";
import { createConsumer } from "./events/consumer.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const redis = getRedis(config);
  const repo = recsRepo(redis);
  const catalog = catalogClient(config);
  const inventory = inventoryClient(config);
  const service = recsService({ config, repo, catalog, inventory, logger });

  const consumer = createConsumer({ config, repo, catalog, logger });
  consumer.start().catch((err) => logger.error({ err }, "consumer_start_failed"));

  const productRefresh = createRefreshWorker({
    logger,
    intervalMs: config.productRefreshMs,
    name: "product",
  });
  productRefresh.start();

  const categoryRefresh = createRefreshWorker({
    logger,
    intervalMs: config.categoryRefreshMs,
    name: "category",
  });
  categoryRefresh.start();

  const app = createServer({
    logger,
    service,
    readyChecks: {
      redis: async () => (await redis.ping()) === "PONG",
    },
  });

  const server = app.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, "service_started");
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, "shutdown_requested");
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, "shutdown_failed");
        process.exit(1);
      }
      await consumer.stop().catch(() => undefined);
      await productRefresh.stop().catch(() => undefined);
      await categoryRefresh.stop().catch(() => undefined);
      await disconnectRedis().catch(() => undefined);
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("fatal startup error", err);
  process.exit(1);
});
