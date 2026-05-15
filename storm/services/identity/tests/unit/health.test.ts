import { describe, it, expect } from "vitest";
import request from "supertest";
import { createLogger } from "@storm/logger";

import { createServer } from "../../src/server.js";

describe("identity-service health endpoints", () => {
  const logger = createLogger({ service: "identity-test", pretty: false, level: "error" });
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

  it("GET /ready returns 503 when any check fails", async () => {
    const failing = createServer({
      logger,
      readyChecks: { db: async () => false },
    });
    const res = await request(failing).get("/ready");
    expect(res.status).toBe(503);
  });

  it("unknown routes return 404 with standard error shape", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.requestId).toBeDefined();
  });
});
