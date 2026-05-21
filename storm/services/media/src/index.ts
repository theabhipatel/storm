import "./tracing.js";

import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { disconnectPrisma, getPrisma } from "./infra/prisma.js";
import { createS3Client } from "./infra/s3.js";
import { createOutboxPoller } from "./outbox/poller.js";
import { createProducer } from "./outbox/producer.js";
import { createServer } from "./server.js";
import { createCleanupWorker } from "./workers/cleanupWorker.js";
import { createThumbnailWorker } from "./workers/thumbnailWorker.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const prisma = getPrisma(config.databaseUrl);
  const s3 = createS3Client(config);

  const producer = createProducer(config);
  const poller = createOutboxPoller({
    prisma,
    producer,
    logger,
    producerName: SERVICE_NAME,
  });
  poller.start();

  const thumbnailWorker = createThumbnailWorker({ prisma, s3, config, logger });
  thumbnailWorker.start();

  const cleanupWorker = createCleanupWorker({ prisma, s3, config, logger });
  cleanupWorker.start();

  const app = createServer({
    logger,
    prisma,
    s3,
    config,
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
      await thumbnailWorker.stop().catch(() => undefined);
      await cleanupWorker.stop().catch(() => undefined);
      await poller.stop().catch(() => undefined);
      await producer.disconnect().catch(() => undefined);
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
