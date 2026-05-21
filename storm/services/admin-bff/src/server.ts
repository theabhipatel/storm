import express, { type Express } from "express";
import {
  requestContext,
  requestLogger,
  authContext,
  errorHandler,
  notFoundHandler,
  securityHeaders,
  corsAllowlist,
} from "@storm/middlewares";
import { metricsHandler } from "@storm/observability";
import type { Logger } from "@storm/logger";

import { SERVICE_NAME, type Config } from "./config.js";
import { auditRouter } from "./routes/audit.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { exportsRouter } from "./routes/exports.js";
import { adminNotificationsRouter } from "./routes/notifications.js";
import { ordersRouter } from "./routes/orders.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export function createServer(opts: {
  logger: Logger;
  config: Config;
  readyChecks?: ReadyChecks;
}): Express {
  const app = express();
  const { logger, config, readyChecks = {} } = opts;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(securityHeaders({ apiCsp: true }));
  app.use(corsAllowlist({ allowedOrigins: config.allowedOrigins }));
  app.use(requestContext());
  app.use(requestLogger(logger));
  app.use(authContext());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: SERVICE_NAME });
  });

  app.get("/metrics", metricsHandler(SERVICE_NAME));

  app.get("/ready", async (_req, res) => {
    const results: Record<string, "ok" | "fail"> = {};
    let allOk = true;
    for (const [name, check] of Object.entries(readyChecks)) {
      try {
        const ok = await check();
        results[name] = ok ? "ok" : "fail";
        if (!ok) allOk = false;
      } catch {
        results[name] = "fail";
        allOk = false;
      }
    }
    if (allOk) {
      res.status(200).json({ status: "ready", checks: results });
    } else {
      res.status(503).json({ status: "not_ready", checks: results });
    }
  });

  app.use(dashboardRouter({ config, logger }));
  app.use(auditRouter({ config, logger }));
  app.use(exportsRouter({ config, logger }));
  app.use(adminNotificationsRouter({ config, logger }));
  app.use(ordersRouter({ config, logger }));

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
