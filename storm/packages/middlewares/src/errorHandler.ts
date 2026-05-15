import type { ErrorRequestHandler, RequestHandler } from "express";
import type { Logger } from "@storm/logger";
import { getContext } from "@storm/logger";
import { StormError, ErrorCodes, type ErrorBody } from "@storm/contracts";
import { ZodError } from "zod";

export function notFoundHandler(): RequestHandler {
  return (_req, _res, next) => {
    next(
      new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Route not found.",
        status: 404,
      }),
    );
  };
}

export function errorHandler(logger: Logger): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err, _req, res, _next) => {
    const requestId = getContext()?.requestId ?? "unknown";

    if (err instanceof StormError) {
      const body: ErrorBody = {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
          requestId,
        },
      };
      if (err.status >= 500) {
        logger.error({ err, code: err.code }, "request_failed");
      } else {
        logger.warn({ code: err.code, status: err.status }, "request_rejected");
      }
      res.status(err.status).json(body);
      return;
    }

    if (err instanceof ZodError) {
      const body: ErrorBody = {
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Request validation failed.",
          details: { issues: err.issues },
          requestId,
        },
      };
      logger.warn({ issues: err.issues }, "validation_failed");
      res.status(422).json(body);
      return;
    }

    logger.error({ err }, "unhandled_error");
    const body: ErrorBody = {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "An unexpected error occurred.",
        requestId,
      },
    };
    res.status(500).json(body);
  };
}
