import * as Sentry from "@sentry/nextjs";

const dsn = process.env["SENTRY_DSN"];

if (dsn) {
  const release = process.env["RELEASE"];
  Sentry.init({
    dsn,
    environment: process.env["DEPLOY_ENV"] ?? process.env["NODE_ENV"] ?? "development",
    ...(release ? { release } : {}),
    tracesSampleRate: 0.1,
  });
}
