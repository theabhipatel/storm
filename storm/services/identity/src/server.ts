import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import type { PrismaClient } from "@prisma/client";
import type { Redis } from "ioredis";
import {
  requestContext,
  requestLogger,
  authContext,
  errorHandler,
  notFoundHandler,
} from "@storm/middlewares";
import type { Logger } from "@storm/logger";

import type { KeySet } from "./auth/keys.js";
import type { Config } from "./config.js";
import { SERVICE_NAME } from "./config.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { internalRouter } from "./routes/internal.js";
import { jwksRouter } from "./routes/jwks.js";
import { meRouter } from "./routes/me.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export interface CreateServerOptions {
  logger: Logger;
  config: Config;
  prisma: PrismaClient;
  redis: Redis;
  keys: KeySet;
  readyChecks?: ReadyChecks;
}

export function createServer(opts: CreateServerOptions): Express {
  const app = express();
  const { logger, config, prisma, redis, keys, readyChecks = {} } = opts;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestContext());
  app.use(requestLogger(logger));
  app.use(authContext());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: SERVICE_NAME });
  });

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

  app.use(jwksRouter(keys));
  app.use(authRouter({ prisma, redis, config, keys, logger }));
  app.use(meRouter({ prisma, redis, config, keys, logger }));
  app.use(adminRouter({ prisma, redis, config, keys, logger }));
  app.use(internalRouter({ prisma, redis, config, logger }));

  // routes/handlers go here as endpoints come online

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
