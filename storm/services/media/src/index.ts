import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const app = createServer({ logger });

  const server = app.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, "service_started");
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, "shutdown_requested");
    server.close((err) => {
      if (err) {
        logger.error({ err }, "shutdown_failed");
        process.exit(1);
      }
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
