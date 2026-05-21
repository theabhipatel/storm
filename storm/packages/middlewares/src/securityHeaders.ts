import type { RequestHandler } from "express";

const DEFAULT_HEADERS: Record<string, string> = {
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-site",
};

export interface SecurityHeadersOptions {
  /**
   * When true, also emit a permissive default CSP suited for JSON APIs.
   * Apps that render HTML should set their own CSP with nonces instead.
   */
  apiCsp?: boolean;
  extraHeaders?: Record<string, string>;
}

export function securityHeaders(opts: SecurityHeadersOptions = {}): RequestHandler {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS };
  if (opts.apiCsp) {
    headers["content-security-policy"] = "default-src 'none'; frame-ancestors 'none'";
  }
  if (opts.extraHeaders) Object.assign(headers, opts.extraHeaders);
  return (_req, res, next) => {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    next();
  };
}
