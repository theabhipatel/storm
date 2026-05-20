import { Router, type RequestHandler } from "express";
import type { Logger } from "@storm/logger";

import { requireAdmin } from "../auth/middleware.js";
import type { Config } from "../config.js";
import { proxyJson } from "../services/proxy.js";

export function adminNotificationsRouter(deps: { config: Config; logger: Logger }): Router {
  const router = Router();
  router.use(requireAdmin());

  router.get(
    "/api/admin/notifications",
    asyncRoute(async (req, res) => {
      const query = new URL(req.originalUrl, "http://x").search;
      await proxyJson({
        url: `${deps.config.notificationBaseUrl}/api/admin/notifications${query}`,
        method: "GET",
        req,
        res,
      });
    }),
  );

  router.get(
    "/api/admin/notifications/:eventId",
    asyncRoute(async (req, res) => {
      await proxyJson({
        url: `${deps.config.notificationBaseUrl}/api/admin/notifications/${encodeURIComponent(req.params.eventId!)}`,
        method: "GET",
        req,
        res,
      });
    }),
  );

  router.post(
    "/api/admin/notifications/:eventId/retry",
    asyncRoute(async (req, res) => {
      await proxyJson({
        url: `${deps.config.notificationBaseUrl}/api/admin/notifications/${encodeURIComponent(req.params.eventId!)}/retry`,
        method: "POST",
        req,
        res,
      });
    }),
  );

  return router;
}

function asyncRoute(
  fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
