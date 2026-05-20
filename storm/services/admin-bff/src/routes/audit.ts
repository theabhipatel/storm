import { Router, type RequestHandler } from "express";
import type { Logger } from "@storm/logger";

import { requireAdmin } from "../auth/middleware.js";
import type { Config } from "../config.js";
import { fetchJson } from "../services/proxy.js";

interface OrderListResponse {
  items: Array<{
    id: string;
    status: string;
    createdAt: string;
    customerEmail?: string | null;
  }>;
  nextCursor: string | null;
}

interface AuditEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  reason: string | null;
  changedAt: string;
}

interface OrderAuditResponse {
  orderId: string;
  history: AuditEntry[];
}

export interface AuditFeedItem {
  source: "order";
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  reason: string | null;
  changedAt: string;
  customerEmail?: string | null;
}

const DEFAULT_LOOKBACK_DAYS = 7;
const MAX_ORDERS_SCANNED = 50;

export function auditRouter(deps: { config: Config; logger: Logger }): Router {
  const router = Router();
  router.use(requireAdmin());

  router.get(
    "/api/admin/audit",
    asyncRoute(async (req, res) => {
      const fromRaw = typeof req.query["from"] === "string" ? req.query["from"] : undefined;
      const toRaw = typeof req.query["to"] === "string" ? req.query["to"] : undefined;
      const actor = typeof req.query["actor"] === "string" ? req.query["actor"] : undefined;
      const action = typeof req.query["action"] === "string" ? req.query["action"] : undefined;

      const from = fromRaw
        ? new Date(fromRaw)
        : new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
      const to = toRaw ? new Date(toRaw) : new Date();

      const ordersRes = await fetchJson<OrderListResponse>({
        url: `${deps.config.orderBaseUrl}/api/admin/orders?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&limit=${MAX_ORDERS_SCANNED}`,
        req,
      });
      if (ordersRes.status !== 200 || !ordersRes.data) {
        res.status(ordersRes.status || 502).json({
          error: { code: "ORDER_LIST_FAILED", message: "Could not load orders." },
        });
        return;
      }

      const orders = ordersRes.data.items;
      const histories = await Promise.allSettled(
        orders.map((o) =>
          fetchJson<OrderAuditResponse>({
            url: `${deps.config.orderBaseUrl}/api/admin/orders/${encodeURIComponent(o.id)}/audit`,
            req,
          }).then((r) => ({ order: o, body: r.data })),
        ),
      );

      const feed: AuditFeedItem[] = [];
      for (const r of histories) {
        if (r.status !== "fulfilled" || !r.value.body) continue;
        const { order, body } = r.value;
        for (const h of body.history) {
          feed.push({
            source: "order",
            orderId: order.id,
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            changedBy: h.changedBy,
            reason: h.reason,
            changedAt: h.changedAt,
            customerEmail: order.customerEmail ?? null,
          });
        }
      }

      const filtered = feed.filter((entry) => {
        if (actor && !entry.changedBy.toLowerCase().includes(actor.toLowerCase())) return false;
        if (action && !entry.toStatus.toLowerCase().includes(action.toLowerCase())) return false;
        const t = new Date(entry.changedAt).getTime();
        if (Number.isNaN(t)) return false;
        return t >= from.getTime() && t <= to.getTime();
      });

      filtered.sort((a, b) => b.changedAt.localeCompare(a.changedAt));

      res.json({
        range: { from: from.toISOString(), to: to.toISOString() },
        items: filtered.slice(0, 100),
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
