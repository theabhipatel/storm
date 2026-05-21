import "./tracing.js";

import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { disconnectPrisma, getPrisma } from "./infra/prisma.js";
import { catalogClient } from "./services/catalogClient.js";
import { inventoryClient } from "./services/inventoryClient.js";
import { cartClient } from "./services/cartClient.js";
import { wishlistService } from "./services/wishlistService.js";
import { createConsumer } from "./events/consumer.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const prisma = getPrisma(config.databaseUrl);
  const catalog = catalogClient(config);
  const inventory = inventoryClient(config);
  const cart = cartClient(config);
  const service = wishlistService({ prisma, catalog, inventory, cart, logger });

  const consumer = createConsumer({ config, prisma, logger });
  consumer.start().catch((err) => logger.error({ err }, "consumer_start_failed"));

  const app = createServer({
    logger,
    service,
    readyChecks: {
      postgres: async () => {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      },
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
      await disconnectPrisma().catch(() => undefined);
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
