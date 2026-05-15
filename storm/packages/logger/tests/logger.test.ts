import { describe, it, expect } from "vitest";

import { createLogger, runWithContext, getContext } from "../src/index.js";

describe("@storm/logger", () => {
  it("creates a pino logger with the service field", () => {
    const log = createLogger({ service: "test", pretty: false });
    expect(log).toBeDefined();
    expect(typeof log.info).toBe("function");
  });

  it("propagates context via async-local storage", () => {
    const result = runWithContext({ requestId: "req_abc", traceId: "trc_1" }, () => {
      return getContext();
    });
    expect(result).toEqual({ requestId: "req_abc", traceId: "trc_1" });
  });
});
