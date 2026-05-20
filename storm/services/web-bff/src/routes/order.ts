import { Router, type Request, type Response } from "express";

import type { Config } from "../config.js";
import { forwardHeaders, proxyJson } from "../services/proxy.js";

export function orderRouter(config: Config): Router {
  const router = Router();

  router.post("/api/checkout/init", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.orderBaseUrl}/api/checkout/init`,
        method: "POST",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/orders", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.orderBaseUrl}/api/orders`,
        method: "POST",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/orders", async (req, res, next) => {
    try {
      const query = new URL(req.originalUrl, "http://x").search;
      await proxyJson({
        url: `${config.orderBaseUrl}/api/orders${query}`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/orders/:id", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.orderBaseUrl}/api/orders/${encodeURIComponent(req.params.id!)}`,
        method: "GET",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/api/orders/:id/cancel", async (req, res, next) => {
    try {
      await proxyJson({
        url: `${config.orderBaseUrl}/api/orders/${encodeURIComponent(req.params.id!)}/cancel`,
        method: "POST",
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/api/orders/:id/invoice", async (req, res, next) => {
    try {
      await streamInvoice({
        url: `${config.orderBaseUrl}/api/orders/${encodeURIComponent(req.params.id!)}/invoice`,
        req,
        res,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

async function streamInvoice(args: { url: string; req: Request; res: Response }): Promise<void> {
  const upstream = await fetch(args.url, {
    method: "GET",
    headers: forwardHeaders(args.req),
  });
  args.res.status(upstream.status);
  const ct = upstream.headers.get("content-type");
  if (ct) args.res.setHeader("content-type", ct);
  const cd = upstream.headers.get("content-disposition");
  if (cd) args.res.setHeader("content-disposition", cd);
  if (upstream.status >= 400) {
    args.res.send(await upstream.text());
    return;
  }
  const buf = Buffer.from(await upstream.arrayBuffer());
  args.res.send(buf);
}
