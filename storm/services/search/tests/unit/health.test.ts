import { describe, it, expect } from "vitest";
import request from "supertest";
import { createLogger } from "@storm/logger";

import { createServer } from "../../src/server.js";
import type { Config } from "../../src/config.js";
import type { OpenSearchClient } from "../../src/infra/opensearch.js";

describe("search service health endpoints", () => {
  const logger = createLogger({ service: "search-test", pretty: false, level: "error" });
  const config = {
    productsIndexAlias: "products",
    catalogBaseUrl: "http://localhost",
    mediaBaseUrl: "http://localhost",
  } as unknown as Config;
  const os = {} as unknown as OpenSearchClient;
  const app = createServer({ logger, config, os });

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
