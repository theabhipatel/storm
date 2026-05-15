import type { RequestHandler } from "express";
import { StormError, ErrorCodes } from "@storm/contracts";

const MUTATING_METHODS = new Set(["POST", "PATCH", "DELETE"]);

/**
 * Validates the Idempotency-Key header on mutating requests.
 * Actual server-side dedup (24h KV cache) is implemented per-service
 * once Redis is wired up; this middleware enforces the contract only.
 */
export function idempotencyKey(opts: { required?: boolean } = {}): RequestHandler {
  const required = opts.required ?? true;
  return (req, _res, next) => {
    if (!MUTATING_METHODS.has(req.method)) return next();

    const key = req.header("idempotency-key");
    if (!key) {
      if (required) {
        return next(
          new StormError({
            code: ErrorCodes.BAD_REQUEST,
            message: "Idempotency-Key header is required on mutations.",
            status: 400,
          }),
        );
      }
      return next();
    }

    if (key.length < 8 || key.length > 200) {
      return next(
        new StormError({
          code: ErrorCodes.BAD_REQUEST,
          message: "Idempotency-Key must be 8-200 characters.",
          status: 400,
        }),
      );
    }

    next();
  };
}
