import { describe, it, expect } from "vitest";
import request from "supertest";
import { createLogger } from "@storm/logger";

import { createServer } from "../../src/server.js";

describe("search service health endpoints", () => {
  const logger = createLogger({ service: "search-test", pretty: false, level: "error" });
  const app = createServer({ logger });

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
