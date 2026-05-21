import express, { type Express } from "express";
import {
  requestContext,
  requestLogger,
  authContext,
  errorHandler,
  notFoundHandler,
  securityHeaders,
} from "@storm/middlewares";
import { metricsHandler } from "@storm/observability";
import type { Logger } from "@storm/logger";

import { SERVICE_NAME } from "./config.js";
import { adminNotificationsRouter } from "./routes/admin.js";
import { invoicesRouter } from "./routes/invoices.js";
import { notificationsRouter } from "./routes/notifications.js";
import type { InvoiceStore } from "./services/invoiceStore.js";
import type { MongoState } from "./infra/mongo.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export interface ServerDeps {
  logger: Logger;
  invoiceStore: InvoiceStore;
  mongo: MongoState;
  readyChecks?: ReadyChecks;
}

export function createServer(opts: ServerDeps): Express {
  const app = express();
  const { logger, readyChecks = {} } = opts;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(securityHeaders({ apiCsp: true }));
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

  app.use(invoicesRouter({ store: opts.invoiceStore }));
  app.use(notificationsRouter({ mongo: opts.mongo }));
  app.use(adminNotificationsRouter({ mongo: opts.mongo }));

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
