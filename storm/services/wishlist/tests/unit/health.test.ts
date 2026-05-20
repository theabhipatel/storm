import { describe, it, expect } from "vitest";
import request from "supertest";
import { createLogger } from "@storm/logger";

import { createServer } from "../../src/server.js";
import type { WishlistService } from "../../src/services/wishlistService.js";

describe("wishlist service health endpoints", () => {
  const logger = createLogger({ service: "wishlist-test", pretty: false, level: "error" });
  const service = {} as unknown as WishlistService;
  const app = createServer({ logger, service });

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
