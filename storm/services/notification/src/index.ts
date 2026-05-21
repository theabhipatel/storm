import "./tracing.js";

import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { createNotificationConsumer } from "./events/consumer.js";
import { connectMongo, disconnectMongo, type MongoState } from "./infra/mongo.js";
import { createEmailProvider } from "./providers/email.js";
import { createSmsProvider } from "./providers/sms.js";
import { createServer } from "./server.js";
import { createLocalInvoiceStore } from "./services/invoiceStore.js";
import { ensureTemplatesSeeded } from "./templates/render.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  let mongo: MongoState | undefined;
  try {
    mongo = await connectMongo(config);
  } catch (err) {
    logger.error({ err }, "mongo_connect_failed");
    process.exit(1);
  }
  await ensureTemplatesSeeded(mongo.templates);
  logger.info("templates_seeded");

  const email = createEmailProvider(config);
  const sms = createSmsProvider(config, logger);
  const invoiceStore = createLocalInvoiceStore({ baseDir: config.invoiceStorageDir });

  const consumerSetup = await createNotificationConsumer(config, {
    mongo,
    email,
    sms,
    config,
    logger,
    invoiceStore,
  });
  await consumerSetup.start();
  logger.info({ groupId: config.kafkaConsumerGroup }, "consumer_started");

  const app = createServer({
    logger,
    invoiceStore,
    mongo,
    readyChecks: {
      mongo: async () => {
        await mongo!.db.command({ ping: 1 });
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
      await consumerSetup.stop().catch(() => undefined);
      await disconnectMongo(mongo).catch(() => undefined);
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
