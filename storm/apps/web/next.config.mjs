/** @type {import('next').NextConfig} */

// CSP is set per-request by `middleware.ts` (nonce-based). Other security
// headers are stable so we set them here at config level.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

// Wrap with Sentry only when a DSN + auth token are configured (CI release builds).
async function configWithSentry() {
  const hasDsn = !!process.env.SENTRY_DSN;
  const hasAuthToken = !!process.env.SENTRY_AUTH_TOKEN;
  if (!hasDsn || !hasAuthToken) return nextConfig;
  const { withSentryConfig } = await import("@sentry/nextjs");
  return withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    sourcemaps: { deleteSourcemapsAfterUpload: true },
    tunnelRoute: "/monitoring",
  });
}

export default await configWithSentry();
