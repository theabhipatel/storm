import type { RequestHandler } from "express";
import type { Logger } from "@storm/logger";

export function requestLogger(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      logger.info(
        {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
        },
        "http_request",
      );
    });

    next();
  };
}
