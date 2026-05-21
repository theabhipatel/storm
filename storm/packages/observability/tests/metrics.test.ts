import { describe, it, expect } from "vitest";

import {
  getRegistry,
  observeSearchLatency,
  recordOrderPlaced,
  recordPaymentResult,
  setLowStockCount,
} from "../src/metrics.js";

describe("metrics helpers", () => {
  it("registers default + custom metrics", () => {
    const reg = getRegistry();
    const names = reg.getSingleMetricAsString.bind(reg);
    expect(typeof names).toBe("function");
    const all = reg.getMetricsAsArray().map((m) => m.name);
    expect(all).toContain("http_requests_total");
    expect(all).toContain("http_request_duration_seconds");
    expect(all).toContain("storm_orders_placed_total");
    expect(all).toContain("storm_payments_total");
    expect(all).toContain("storm_search_latency_seconds");
    expect(all).toContain("storm_low_stock_skus");
  });

  it("records orders, payments, search latency and low-stock", async () => {
    recordOrderPlaced("confirmed");
    recordPaymentResult("success");
    observeSearchLatency("search", 0.12);
    setLowStockCount(7);

    const dump = await getRegistry().metrics();
    expect(dump).toMatch(/storm_orders_placed_total\{status="confirmed"\} 1/);
    expect(dump).toMatch(/storm_payments_total\{status="success"\} 1/);
    expect(dump).toContain("storm_search_latency_seconds_bucket");
    expect(dump).toMatch(/storm_low_stock_skus 7/);
  });
});
