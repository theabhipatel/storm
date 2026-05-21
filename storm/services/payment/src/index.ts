import "./tracing.js";

import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { disconnectPrisma, getPrisma } from "./infra/prisma.js";
import { createOutboxPoller } from "./outbox/poller.js";
import { createProducer } from "./outbox/producer.js";
import { paymentRepo } from "./repositories/paymentRepo.js";
import { paymentService } from "./services/paymentService.js";
import { createRazorpayClient } from "./services/razorpayClient.js";
import { createReconciliationWorker } from "./services/reconciliationWorker.js";
import { webhookHandler } from "./services/webhookHandler.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const prisma = getPrisma(config.databaseUrl);
  const repo = paymentRepo(prisma);
  const razorpay = createRazorpayClient(config, logger);
  const service = paymentService({ prisma, repo, razorpay, logger });
  const webhook = webhookHandler({
    prisma,
    payments: service,
    verifySignature: (body, sig) => razorpay.verifyWebhookSignature(body, sig),
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

  const reconciliation = createReconciliationWorker({ prisma, razorpay, logger });
  reconciliation.start();

  const app = createServer({
    logger,
    repo,
    service,
    razorpay,
    webhook,
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
      await reconciliation.stop().catch(() => undefined);
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
