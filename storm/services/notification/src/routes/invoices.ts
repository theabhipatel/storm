import { Router, type RequestHandler } from "express";

import type { InvoiceStore } from "../services/invoiceStore.js";

export function invoicesRouter(deps: { store: InvoiceStore }): Router {
  const router = Router();

  router.get(
    "/api/internal/invoices/:filename",
    asyncRoute(async (req, res) => {
      const filename = req.params.filename ?? "";
      const orderId = filename.replace(/\.pdf$/, "");
      if (!/^[0-9a-f-]+$/i.test(orderId)) {
        res.status(400).json({ error: { code: "INVALID_ORDER_ID" } });
        return;
      }
      const pdf = await deps.store.load(orderId);
      if (!pdf) {
        res.status(404).json({ error: { code: "NOT_FOUND" } });
        return;
      }
      res.setHeader("content-type", "application/pdf");
      res.setHeader("cache-control", "private, max-age=0, no-store");
      res.status(200).send(pdf);
    }),
  );

  return router;
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
