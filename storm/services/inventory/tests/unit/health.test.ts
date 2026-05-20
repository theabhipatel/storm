import { describe, it, expect } from "vitest";
import request from "supertest";
import { createLogger } from "@storm/logger";

import { createServer } from "../../src/server.js";
import type { StockService } from "../../src/services/stockService.js";

describe("inventory service health endpoints", () => {
  const logger = createLogger({ service: "inventory-test", pretty: false, level: "error" });
  const stock = {
    ensureForSku: async () => ({}) as never,
    adjust: async () => ({}) as never,
    list: async () => ({ data: [], nextCursor: null, hasMore: false }),
    detail: async () => ({}) as never,
    lowStockAlerts: async () => [],
    getStock: async () => [],
  } as unknown as StockService;
  const app = createServer({ logger, stock });

  it("GET /health returns 200 ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /ready returns 200 ready when no checks registered", async () => {
    const res = await request(app).get("/ready");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
  });
});
