import { Router } from "express";

import type { Config } from "../config.js";
import { proxyJson } from "../services/proxy.js";

export function notificationsRouter(config: Config): Router {
  const router = Router();

  router.get("/api/me/notifications", async (req, res, next) => {
    try {
      const query = new URL(req.originalUrl, "http://x").search;
      await proxyJson({
        url: `${config.notificationBaseUrl}/api/me/notifications${query}`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
