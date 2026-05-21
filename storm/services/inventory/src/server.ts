import express, { type Express } from "express";
import {
  requestContext,
  requestLogger,
  authContext,
  errorHandler,
  notFoundHandler,
  securityHeaders,
  idempotencyKey,
} from "@storm/middlewares";
import { metricsHandler } from "@storm/observability";
import type { Logger } from "@storm/logger";

import { SERVICE_NAME } from "./config.js";
import { adminRouter } from "./routes/admin.js";
import { internalRouter } from "./routes/internal.js";
import type { PrismaClient } from "./db.js";
import type { StockService } from "./services/stockService.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export interface CreateServerOptions {
  logger: Logger;
  stock: StockService;
  prisma: PrismaClient;
  readyChecks?: ReadyChecks;
}

export function createServer(opts: CreateServerOptions): Express {
  const app = express();
  const { logger, stock, prisma, readyChecks = {} } = opts;

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

  app.use(internalRouter(stock, prisma));

  app.use(idempotencyKey({ required: true }));
  app.use(adminRouter(stock));

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
