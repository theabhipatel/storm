import type { RequestHandler } from "express";
import { runWithContext } from "@storm/logger";
import { v7 as uuidv7 } from "uuid";

/**
 * Generates / accepts X-Request-Id, extracts W3C traceparent,
 * and runs the rest of the chain inside an async-local context.
 */
export function requestContext(): RequestHandler {
  return (req, res, next) => {
    const incomingId = req.header("x-request-id");
    const requestId = incomingId && incomingId.length > 0 ? incomingId : `req_${uuidv7()}`;

    const traceparent = req.header("traceparent");
    const traceId = parseTraceId(traceparent) ?? requestId;
    const spanId = parseSpanId(traceparent);

    res.setHeader("X-Request-Id", requestId);

    runWithContext({ requestId, traceId, ...(spanId ? { spanId } : {}) }, () => {
      next();
    });
  };
}

function parseTraceId(tp: string | undefined): string | undefined {
  if (!tp) return undefined;
  const parts = tp.split("-");
  return parts[1];
}

function parseSpanId(tp: string | undefined): string | undefined {
  if (!tp) return undefined;
  const parts = tp.split("-");
  return parts[2];
}
