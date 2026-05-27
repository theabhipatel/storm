import type { RequestHandler } from "express";

export interface CorsAllowlistOptions {
  allowedOrigins: string[];
  /**
   * Routes that are part of session establishment may set
   * `Access-Control-Allow-Credentials`. Other routes do not.
   */
  credentialsRoutes?: RegExp[];
}

export function corsAllowlist(opts: CorsAllowlistOptions): RequestHandler {
  const set = new Set(opts.allowedOrigins);
  const credentialMatchers = opts.credentialsRoutes ?? [];

  return (req, res, next) => {
    const origin = req.header("origin");
    if (!origin) return next();

    if (!set.has(origin)) {
      if (req.method === "OPTIONS") {
        res.status(403).end();
        return;
      }
      return next();
    }

    res.setHeader("vary", "Origin");
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader(
      "access-control-allow-methods",
      "GET,HEAD,POST,PATCH,DELETE,OPTIONS",
    );
    res.setHeader(
      "access-control-allow-headers",
      "authorization,content-type,idempotency-key,x-request-id,x-csrf-token,x-user-id,x-user-role,x-session-id,x-token-version",
    );
    res.setHeader("access-control-max-age", "600");

    const allowCredentials = credentialMatchers.some((re) => re.test(req.path));
    if (allowCredentials) {
      res.setHeader("access-control-allow-credentials", "true");
    }

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  };
}
