import { describe, it, expect } from "vitest";

import {
  requestContext,
  requestLogger,
  authContext,
  idempotencyKey,
  errorHandler,
  notFoundHandler,
} from "../src/index.js";

describe("@storm/middlewares", () => {
  it("exports the expected middleware factories", () => {
    expect(typeof requestContext).toBe("function");
    expect(typeof requestLogger).toBe("function");
    expect(typeof authContext).toBe("function");
    expect(typeof idempotencyKey).toBe("function");
    expect(typeof errorHandler).toBe("function");
    expect(typeof notFoundHandler).toBe("function");
  });

  it("requestContext() returns an Express handler", () => {
    const mw = requestContext();
    expect(mw.length).toBe(3);
  });
});
