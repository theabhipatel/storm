import { createLogger } from "@storm/logger";

import { loadKeySet } from "./auth/keys.js";
import { loadConfig, SERVICE_NAME } from "./config.js";
import { disconnectPrisma, getPrisma } from "./infra/prisma.js";
import { disconnectRedis, getRedis } from "./infra/redis.js";
import { createOutboxPoller } from "./outbox/poller.js";
import { createProducer } from "./outbox/producer.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const prisma = getPrisma(config.databaseUrl);
  const redis = getRedis(config.redisUrl);
  const keys = await loadKeySet(config);

  const producer = createProducer(config);
  const poller = createOutboxPoller({
    prisma,
    producer,
    logger,
    producerName: SERVICE_NAME,
  });
  poller.start();

  const app = createServer({
    logger,
    config,
    prisma,
    redis,
    keys,
    readyChecks: {
      postgres: async () => {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      },
      redis: async () => {
        const pong = await redis.ping();
        return pong === "PONG";
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
      await poller.stop().catch(() => undefined);
      await producer.disconnect().catch(() => undefined);
      await disconnectPrisma().catch(() => undefined);
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
