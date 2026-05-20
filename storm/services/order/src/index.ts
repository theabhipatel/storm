import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { disconnectPrisma, getPrisma } from "./infra/prisma.js";
import { disconnectRedis, getRedis } from "./infra/redis.js";
import { createConsumer } from "./events/consumer.js";
import { createOutboxPoller } from "./outbox/poller.js";
import { createProducer } from "./outbox/producer.js";
import { orderRepo } from "./repositories/orderRepo.js";
import { createCartClient } from "./services/cartClient.js";
import { createIdempotencyCache } from "./services/idempotencyCache.js";
import { createIdentityClient } from "./services/identityClient.js";
import { createInventoryClient } from "./services/inventoryClient.js";
import { orderService } from "./services/orderService.js";
import { createPaymentClient } from "./services/paymentClient.js";
import { createSweepWorker } from "./services/sweepWorker.js";
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
  const repo = orderRepo(prisma);
  const cart = createCartClient(config);
  const identity = createIdentityClient(config);
  const payments = createPaymentClient(config);
  const inventory = createInventoryClient({
    address: config.inventoryGrpcAddress,
    reserveTimeoutMs: config.inventoryReserveTimeoutMs,
  });
  const idempotency = createIdempotencyCache({
    redis,
    ttlSec: config.idempotencyTtlSec,
  });
  const service = orderService({
    prisma,
    repo,
    cart,
    identity,
    inventory,
    payments,
    idempotency,
    config,
    logger,
  });

  const producer = createProducer(config);
  const poller = createOutboxPoller({
    prisma,
    producer,
    logger,
    producerName: SERVICE_NAME,
  });
  poller.start();

  const sweep = createSweepWorker({
    service,
    logger,
    intervalMs: config.ttlSweepIntervalMs,
  });
  sweep.start();

  const consumer = createConsumer({ config, prisma, service, logger });
  consumer.start().catch((err) => {
    logger.error({ err }, "consumer_start_failed");
  });

  const app = createServer({
    logger,
    config,
    prisma,
    service,
    repo,
    cart,
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
      await consumer.stop().catch(() => undefined);
      await sweep.stop().catch(() => undefined);
      await poller.stop().catch(() => undefined);
      await producer.disconnect().catch(() => undefined);
      inventory.close();
      await disconnectRedis().catch(() => undefined);
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
