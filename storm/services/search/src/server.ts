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

import type { Config } from "./config.js";
import { SERVICE_NAME } from "./config.js";
import type { OpenSearchClient } from "./infra/opensearch.js";
import { searchService } from "./services/searchService.js";
import { reindexService } from "./services/reindexService.js";
import { catalogClient } from "./services/catalogClient.js";
import { mediaClient } from "./services/mediaClient.js";
import { searchRouter } from "./routes/search.js";
import { adminRouter } from "./routes/admin.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export interface CreateServerOptions {
  logger: Logger;
  config: Config;
  os: OpenSearchClient;
  readyChecks?: ReadyChecks;
}

export function createServer(opts: CreateServerOptions): Express {
  const app = express();
  const { logger, config, os, readyChecks = {} } = opts;

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

  const svc = searchService(os, config.productsIndexAlias);
  app.use("/api", searchRouter(svc));

  const reindex = reindexService({
    os,
    alias: config.productsIndexAlias,
    catalog: catalogClient(config),
    media: mediaClient(config),
    logger,
  });
  app.use("/api", idempotencyKey({ required: true }), adminRouter(reindex));

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
