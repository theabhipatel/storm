import * as Sentry from "@sentry/nextjs";

const dsn = process.env["NEXT_PUBLIC_SENTRY_DSN"];

if (dsn) {
  const release = process.env["NEXT_PUBLIC_RELEASE"];
  Sentry.init({
    dsn,
    environment: process.env["NEXT_PUBLIC_DEPLOY_ENV"] ?? "development",
    ...(release ? { release } : {}),
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.05,
    integrations: [],
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}
