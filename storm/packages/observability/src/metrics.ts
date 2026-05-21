import type { Request, RequestHandler, Response, NextFunction } from "express";
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";

const registry = new Registry();
collectDefaultMetrics({ register: registry });

export function getRegistry(): Registry {
  return registry;
}

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests handled.",
  labelNames: ["service", "method", "route", "status_code"] as const,
  registers: [registry],
});

export const httpDurationHistogram = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["service", "method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

const ordersPlacedTotal = new Counter({
  name: "storm_orders_placed_total",
  help: "Total customer orders placed (post-payment-init).",
  labelNames: ["status"] as const,
  registers: [registry],
});

const paymentsTotal = new Counter({
  name: "storm_payments_total",
  help: "Total payment outcomes seen by the service.",
  labelNames: ["status"] as const,
  registers: [registry],
});

const searchLatencyHistogram = new Histogram({
  name: "storm_search_latency_seconds",
  help: "Search query latency in seconds.",
  labelNames: ["surface"] as const,
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  registers: [registry],
});

const lowStockGauge = new Gauge({
  name: "storm_low_stock_skus",
  help: "Number of SKUs currently in low-stock state.",
  registers: [registry],
});

export function recordOrderPlaced(status: "pending_payment" | "confirmed" | "failed"): void {
  ordersPlacedTotal.inc({ status });
}

export function recordPaymentResult(status: "success" | "failed"): void {
  paymentsTotal.inc({ status });
}

export function observeSearchLatency(surface: "search" | "autocomplete", seconds: number): void {
  searchLatencyHistogram.observe({ surface }, seconds);
}

export function setLowStockCount(count: number): void {
  lowStockGauge.set(count);
}

export function metricsHandler(serviceName: string): RequestHandler {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.setHeader("content-type", registry.contentType);
      res.setHeader("cache-control", "no-store");
      const body = await registry.metrics();
      res.status(200).send(body);
      void serviceName;
    } catch (err) {
      next(err);
    }
  };
}
