import "./tracing.js";

import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { disconnectPrisma, getPrisma } from "./infra/prisma.js";
import { createOutboxPoller } from "./outbox/poller.js";
import { createProducer } from "./outbox/producer.js";
import { reservationService } from "./services/reservationService.js";
import { stockService } from "./services/stockService.js";
import { createSweepWorker } from "./services/sweepWorker.js";
import { createLowStockWorker } from "./services/lowStockWorker.js";
import { createConsumer } from "./events/consumer.js";
import { createGrpcServer } from "./grpc/server.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const prisma = getPrisma(config.databaseUrl);
  const stock = stockService(prisma);
  const reservations = reservationService({ prisma, logger });

  const producer = createProducer(config);
  const poller = createOutboxPoller({
    prisma,
    producer,
    logger,
    producerName: SERVICE_NAME,
  });
  poller.start();

  const sweep = createSweepWorker({
    prisma,
    logger,
    intervalMs: config.sweepIntervalMs,
  });
  sweep.start();

  const lowStock = createLowStockWorker({
    prisma,
    logger,
    intervalMs: config.lowStockIntervalMs,
  });
  lowStock.start();

  const consumer = createConsumer({
    config,
    prisma,
    logger,
    stock,
    reservations,
  });
  consumer.start().catch((err) => {
    logger.error({ err }, "consumer_start_failed");
  });

  const grpc = createGrpcServer({
    reservations,
    stock,
    port: config.grpcPort,
    defaultTtlSec: config.defaultReservationTtlSec,
    logger,
  });
  await grpc.start();

  const app = createServer({
    logger,
    stock,
    prisma,
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
      await grpc.stop().catch(() => undefined);
      await consumer.stop().catch(() => undefined);
      await sweep.stop().catch(() => undefined);
      await lowStock.stop().catch(() => undefined);
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
