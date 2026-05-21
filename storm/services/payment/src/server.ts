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
import { adminRouter } from "./routes/admin.js";
import { paymentsRouter } from "./routes/payments.js";
import { webhookRouter } from "./routes/webhook.js";
import type { PaymentRepo } from "./repositories/paymentRepo.js";
import type { PaymentService } from "./services/paymentService.js";
import type { RazorpayClient } from "./services/razorpayClient.js";
import type { WebhookHandler } from "./services/webhookHandler.js";
import type { PrismaClient } from "./db.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export interface ServerDeps {
  logger: Logger;
  repo: PaymentRepo;
  service: PaymentService;
  razorpay: RazorpayClient;
  webhook: WebhookHandler;
  prisma: PrismaClient;
  readyChecks?: ReadyChecks;
}

export function createServer(opts: ServerDeps): Express {
  const app = express();
  const { logger, readyChecks = {} } = opts;

  app.disable("x-powered-by");

  // Webhook needs the raw body for HMAC verification; mount it before JSON parser.
  app.use(
    "/webhooks/razorpay",
    express.raw({ type: "*/*", limit: "1mb" }),
  );

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

  app.use(
    webhookRouter({ handler: opts.webhook, logger }),
  );
  app.use(
    paymentsRouter({ service: opts.service, repo: opts.repo, razorpay: opts.razorpay }),
  );
  app.use(adminRouter({ repo: opts.repo, prisma: opts.prisma }));

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
