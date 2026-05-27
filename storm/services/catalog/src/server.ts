import express, { type Express } from "express";
import type { PrismaClient } from "./db.js";
import {
  requestContext,
  requestLogger,
  authContext,
  errorHandler,
  notFoundHandler,
  securityHeaders,
  idempotencyKey,
  corsAllowlist,
} from "@storm/middlewares";
import { metricsHandler } from "@storm/observability";
import type { Logger } from "@storm/logger";

import { SERVICE_NAME } from "./config.js";
import { adminBrandsRouter } from "./routes/adminBrands.js";
import { adminCategoriesRouter } from "./routes/adminCategories.js";
import { adminProductsRouter } from "./routes/adminProducts.js";
import { publicRouter } from "./routes/public.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export interface CreateServerOptions {
  logger: Logger;
  prisma: PrismaClient;
  readyChecks?: ReadyChecks;
}

export function createServer(opts: CreateServerOptions): Express {
  const app = express();
  const { logger, prisma, readyChecks = {} } = opts;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(securityHeaders({ apiCsp: true }));
  app.use(
    corsAllowlist({
      allowedOrigins: (process.env["ALLOWED_ORIGINS"] ?? "http://localhost:3200,http://localhost:3300")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }),
  );
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

  // Public reads — used by web-bff for /p/:slug and admin app for listings of brand/category.
  app.use(publicRouter(prisma));

  // Admin endpoints: idempotency-key on mutations, admin-role guard inside routers.
  app.use(idempotencyKey({ required: true }));
  app.use(adminBrandsRouter(prisma));
  app.use(adminCategoriesRouter(prisma));
  app.use(adminProductsRouter(prisma));

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
