import { describe, it, expect } from "vitest";

import { ErrorCodes, ErrorBodySchema, StormError } from "../src/errors/index.js";

describe("@storm/contracts/errors", () => {
  it("exposes a stable error code catalog", () => {
    expect(ErrorCodes.NOT_FOUND).toBe("NOT_FOUND");
    expect(ErrorCodes.VALIDATION_FAILED).toBe("VALIDATION_FAILED");
  });

  it("validates the standard error body shape", () => {
    const parsed = ErrorBodySchema.parse({
      error: { code: "NOT_FOUND", message: "missing", requestId: "req_1" },
    });
    expect(parsed.error.code).toBe("NOT_FOUND");
  });

  it("StormError carries code and status", () => {
    const err = new StormError({ code: "NOT_FOUND", message: "x", status: 404 });
    expect(err.status).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });
});
