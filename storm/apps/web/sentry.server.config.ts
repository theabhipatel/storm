import * as Sentry from "@sentry/nextjs";

const dsn = process.env["SENTRY_DSN"];

if (dsn) {
  const release = process.env["RELEASE"];
  Sentry.init({
    dsn,
    environment: process.env["DEPLOY_ENV"] ?? process.env["NODE_ENV"] ?? "development",
    ...(release ? { release } : {}),
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}
