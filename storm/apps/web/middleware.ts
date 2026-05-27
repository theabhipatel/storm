import { NextResponse, type NextRequest } from "next/server";

// Per-request CSP nonce wiring. Generates a fresh base64 nonce, attaches it
// to the request headers (so server components can read it via `headers()`),
// and writes a strict CSP that allow-lists that nonce.
//
// In dev Next.js injects inline bootstrap scripts that don't carry our
// nonce, so we relax script-src to 'unsafe-inline' there. Production stays
// strict.

const ALLOWED_RAZORPAY = [
  "https://checkout.razorpay.com",
  "https://api.razorpay.com",
  "https://lumberjack.razorpay.com",
];

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function buildCsp(nonce: string, env: string): string {
  const scriptSrc =
    env === "production"
      ? `'self' 'strict-dynamic' 'nonce-${nonce}' https://checkout.razorpay.com`
      : `'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com`;

  const apiOrigins = [
    originOf(process.env["NEXT_PUBLIC_API_BASE_URL"]) ?? "http://localhost:8000",
    originOf(process.env["NEXT_PUBLIC_KONG_BASE_URL"]),
    originOf(process.env["NEXT_PUBLIC_WEB_BFF_BASE_URL"]),
  ].filter((v): v is string => Boolean(v));
  const connectSrc = Array.from(new Set(["'self'", ...apiOrigins, ...ALLOWED_RAZORPAY])).join(" ");

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];
  const allApiOriginsHttps = apiOrigins.length > 0 && apiOrigins.every((o) => o.startsWith("https://"));
  if (env === "production" && allApiOriginsHttps) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function middleware(req: NextRequest): NextResponse {
  const nonce = generateNonce();
  const env = process.env["NODE_ENV"] ?? "development";
  const csp = buildCsp(nonce, env);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-storm-csp-nonce", nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("x-storm-csp-nonce", nonce);
  return res;
}

export const config = {
  matcher: [
    // Skip static assets, image optimisation, and API routes (which set
    // their own headers via the server middleware package).
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
