import { Router, type RequestHandler } from "express";
import type { Logger } from "@storm/logger";

import type { WebhookHandler } from "../services/webhookHandler.js";

export function webhookRouter(deps: { handler: WebhookHandler; logger: Logger }): Router {
  const router = Router();

  router.post("/webhooks/razorpay", asyncRoute(async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ error: { code: "INVALID_BODY", message: "raw body required" } });
      return;
    }
    const rawBody = req.body.toString("utf8");
    if (!rawBody) {
      res.status(400).json({ error: { code: "INVALID_BODY", message: "empty body" } });
      return;
    }
    const signature = String(req.header("x-razorpay-signature") ?? "");
    const headerEventId = String(req.header("x-razorpay-event-id") ?? "");
    try {
      const result = await deps.handler.process({
        rawBody,
        signature,
        ...(headerEventId ? { headerEventId } : {}),
      });
      res.status(200).json({ status: result.status });
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      deps.logger.error({ err }, "razorpay_webhook_failed");
      res.status(status).json({
        error: {
          code: status === 400 ? "INVALID_SIGNATURE" : "WEBHOOK_FAILED",
          message: (err as Error).message,
        },
      });
    }
  }));

  return router;
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
