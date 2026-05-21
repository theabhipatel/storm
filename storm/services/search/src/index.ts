import "./tracing.js";

import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { createServer } from "./server.js";
import { disconnectOpenSearch, getOpenSearch } from "./infra/opensearch.js";
import { bootstrapIndices } from "./infra/bootstrap.js";
import { catalogClient } from "./services/catalogClient.js";
import { mediaClient } from "./services/mediaClient.js";
import { indexer } from "./services/indexer.js";
import { productDocRepo } from "./repositories/productDoc.js";
import { processedEventsRepo } from "./repositories/processedEvents.js";
import { createConsumer } from "./events/consumer.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const os = getOpenSearch(config);
  await bootstrapIndices({
    os,
    alias: config.productsIndexAlias,
    processedEventsIndex: config.processedEventsIndex,
    logger,
  });

  const catalog = catalogClient(config);
  const media = mediaClient(config);
  const productDocs = productDocRepo(os, config.productsIndexAlias);
  const processed = processedEventsRepo(os, config.processedEventsIndex);
  const idx = indexer({ catalog, media, productDocs, logger });

  const consumer = createConsumer({
    config,
    os,
    logger,
    indexer: idx,
    catalog,
    productDocs,
    processed,
  });
  if (config.enableConsumer) {
    consumer.start().catch((err) => {
      logger.error({ err }, "consumer_start_failed");
    });
  } else {
    logger.warn("search_consumer_disabled");
  }

  const app = createServer({
    logger,
    config,
    os,
    readyChecks: {
      opensearch: async () => {
        const r = await os.cluster.health();
        const status = r.body?.status as string | undefined;
        return status === "green" || status === "yellow";
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
      await disconnectOpenSearch().catch(() => undefined);
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
