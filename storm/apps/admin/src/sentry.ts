import * as Sentry from "@sentry/react";

const dsn = import.meta.env["VITE_SENTRY_DSN"] as string | undefined;

export function initSentry(): void {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: (import.meta.env["VITE_DEPLOY_ENV"] as string) ?? "development",
    release: (import.meta.env["VITE_RELEASE"] as string) ?? undefined,
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

export { Sentry };
