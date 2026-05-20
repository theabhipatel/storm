import { Router, type RequestHandler } from "express";
import type { Logger } from "@storm/logger";

import { requireAdmin } from "../auth/middleware.js";
import type { Config } from "../config.js";
import { fetchJson } from "../services/proxy.js";

interface OrderMetrics {
  count: number;
  revenuePaise: number;
  aovPaise: number;
  cancelledCount: number;
  currency: string;
}

interface LowStockResponse {
  items: Array<{ sku: string; available: number; threshold: number }>;
}

interface UserListResponse {
  items: Array<{ id: string; createdAt: string; blocked?: boolean }>;
  nextCursor?: string | null;
}

interface PaymentListResponse {
  items: Array<{ id: string; status: string; createdAt: string }>;
  nextCursor?: string | null;
}

interface RecentOrderListResponse {
  items: Array<{
    id: string;
    status: string;
    totalPaise: number;
    currency: string;
    createdAt: string;
    customerEmail?: string | null;
  }>;
}

export interface DashboardResponse {
  range: { from: string; to: string };
  orders: { count: number; revenuePaise: number; aovPaise: number; cancelledCount: number };
  users: { newCount: number };
  inventory: { lowStockCount: number };
  payments: { failedCount: number };
  recentOrders: RecentOrderListResponse["items"];
  warnings: string[];
}

function dateRangeFromQuery(query: Record<string, unknown>): { from: Date; to: Date } {
  const fromRaw = typeof query["from"] === "string" ? query["from"] : undefined;
  const toRaw = typeof query["to"] === "string" ? query["to"] : undefined;
  let from = fromRaw ? new Date(fromRaw) : undefined;
  let to = toRaw ? new Date(toRaw) : undefined;
  if (!from || Number.isNaN(from.getTime())) {
    from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }
  if (!to || Number.isNaN(to.getTime())) {
    to = new Date();
  }
  return { from, to };
}

export function dashboardRouter(deps: { config: Config; logger: Logger }): Router {
  const router = Router();
  router.use(requireAdmin());

  router.get(
    "/api/admin/dashboard",
    asyncRoute(async (req, res) => {
      const { from, to } = dateRangeFromQuery(req.query as Record<string, unknown>);
      const fromIso = from.toISOString();
      const toIso = to.toISOString();
      const warnings: string[] = [];

      const ordersMetricsPromise = fetchJson<OrderMetrics>({
        url: `${deps.config.orderBaseUrl}/api/admin/orders/metrics?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`,
        req,
      });

      const recentOrdersPromise = fetchJson<RecentOrderListResponse>({
        url: `${deps.config.orderBaseUrl}/api/admin/orders?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}&limit=10`,
        req,
      });

      const usersPromise = fetchJson<UserListResponse>({
        url: `${deps.config.identityBaseUrl}/api/admin/users?createdFrom=${encodeURIComponent(fromIso)}&createdTo=${encodeURIComponent(toIso)}&limit=100`,
        req,
      });

      const lowStockPromise = fetchJson<LowStockResponse>({
        url: `${deps.config.inventoryBaseUrl}/api/admin/low-stock-alerts`,
        req,
      });

      const failedPaymentsPromise = fetchJson<PaymentListResponse>({
        url: `${deps.config.paymentBaseUrl}/api/admin/payments?status=failed&from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}&limit=100`,
        req,
      });

      const [
        ordersMetricsRes,
        recentOrdersRes,
        usersRes,
        lowStockRes,
        failedPaymentsRes,
      ] = await Promise.allSettled([
        ordersMetricsPromise,
        recentOrdersPromise,
        usersPromise,
        lowStockPromise,
        failedPaymentsPromise,
      ]);

      const orders =
        ordersMetricsRes.status === "fulfilled" &&
        ordersMetricsRes.value.status === 200 &&
        ordersMetricsRes.value.data
          ? ordersMetricsRes.value.data
          : (warnings.push("orders_metrics_unavailable"),
            { count: 0, revenuePaise: 0, aovPaise: 0, cancelledCount: 0, currency: "INR" });

      const recentOrders =
        recentOrdersRes.status === "fulfilled" &&
        recentOrdersRes.value.status === 200 &&
        recentOrdersRes.value.data
          ? recentOrdersRes.value.data.items
          : (warnings.push("recent_orders_unavailable"), []);

      const newUsersCount =
        usersRes.status === "fulfilled" &&
        usersRes.value.status === 200 &&
        usersRes.value.data
          ? usersRes.value.data.items.length
          : (warnings.push("users_metric_unavailable"), 0);

      const lowStockCount =
        lowStockRes.status === "fulfilled" &&
        lowStockRes.value.status === 200 &&
        lowStockRes.value.data
          ? lowStockRes.value.data.items.length
          : (warnings.push("low_stock_unavailable"), 0);

      const failedCount =
        failedPaymentsRes.status === "fulfilled" &&
        failedPaymentsRes.value.status === 200 &&
        failedPaymentsRes.value.data
          ? failedPaymentsRes.value.data.items.length
          : (warnings.push("failed_payments_unavailable"), 0);

      const body: DashboardResponse = {
        range: { from: fromIso, to: toIso },
        orders: {
          count: orders.count,
          revenuePaise: orders.revenuePaise,
          aovPaise: orders.aovPaise,
          cancelledCount: orders.cancelledCount,
        },
        users: { newCount: newUsersCount },
        inventory: { lowStockCount },
        payments: { failedCount },
        recentOrders,
        warnings,
      };

      res.json(body);
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
