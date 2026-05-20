import type { Request, Response } from "express";
import { StormError, ErrorCodes } from "@storm/contracts";

// Forward identity + idempotency headers from the upstream gateway request to a
// downstream service. Keeps downstream services unaware of the BFF intermediary.
export function forwardHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/json",
    "content-type": "application/json",
  };
  const userId = req.header("x-user-id");
  if (userId) headers["x-user-id"] = userId;
  const role = req.header("x-user-role");
  if (role) headers["x-user-role"] = role;
  const idem = req.header("idempotency-key");
  if (idem) headers["idempotency-key"] = idem;
  const reqId = req.header("x-request-id");
  if (reqId) headers["x-request-id"] = reqId;
  return headers;
}

export async function proxyJson(args: {
  url: string;
  method: string;
  req: Request;
  res: Response;
}): Promise<void> {
  const { url, method, req, res } = args;
  const init: RequestInit = {
    method,
    headers: forwardHeaders(req),
  };
  if (method !== "GET" && method !== "DELETE") {
    init.body = JSON.stringify(req.body ?? {});
  }
  const upstream = await fetch(url, init);
  const text = await upstream.text();
  res.status(upstream.status);
  res.setHeader("content-type", upstream.headers.get("content-type") ?? "application/json");
  res.send(text);
}

export function unauthenticated(): StormError {
  return new StormError({
    code: ErrorCodes.UNAUTHENTICATED,
    message: "Authentication required.",
    status: 401,
  });
}
