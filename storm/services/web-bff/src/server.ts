import express, { type Express } from "express";
import {
  requestContext,
  requestLogger,
  authContext,
  errorHandler,
  notFoundHandler,
} from "@storm/middlewares";
import type { Logger } from "@storm/logger";

import type { Config } from "./config.js";
import { SERVICE_NAME } from "./config.js";
import type { Cache } from "./services/cache.js";
import { catalogReadRouter } from "./routes/catalog.js";
import { productRouter } from "./routes/product.js";
import { searchRouter } from "./routes/search.js";
import { homeRouter } from "./routes/home.js";
import { categoryRouter } from "./routes/category.js";
import { cartRouter } from "./routes/cart.js";
import { wishlistRouter } from "./routes/wishlist.js";
import { recommendationsRouter } from "./routes/recommendations.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export function createServer(opts: {
  logger: Logger;
  config: Config;
  cache: Cache;
  readyChecks?: ReadyChecks;
}): Express {
  const app = express();
  const { logger, config, cache, readyChecks = {} } = opts;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
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

  app.use(productRouter(config));
  app.use(catalogReadRouter(config));
  app.use(searchRouter(config));
  app.use(categoryRouter(config));
  app.use(homeRouter(config, cache));
  app.use(cartRouter(config));
  app.use(wishlistRouter(config));
  app.use(recommendationsRouter(config));

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
