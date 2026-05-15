import { AsyncLocalStorage } from "node:async_hooks";

import { pino, type Logger, type LoggerOptions } from "pino";

export interface LogContext {
  traceId?: string;
  spanId?: string;
  requestId?: string;
  userId?: string;
}

const als = new AsyncLocalStorage<LogContext>();

export interface CreateLoggerOptions {
  service: string;
  level?: "debug" | "info" | "warn" | "error";
  pretty?: boolean;
}

export function createLogger(opts: CreateLoggerOptions): Logger {
  const level = opts.level ?? process.env["LOG_LEVEL"] ?? "info";
  const pretty = opts.pretty ?? process.env["NODE_ENV"] !== "production";

  const options: LoggerOptions = {
    level,
    base: { service: opts.service },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      log: (obj) => {
        const ctx = als.getStore();
        if (!ctx) return obj;
        return { ...ctx, ...obj };
      },
    },
    redact: {
      paths: [
        "password",
        "*.password",
        "token",
        "*.token",
        "authorization",
        "*.authorization",
        "otp",
        "*.otp",
        "secret",
        "*.secret",
      ],
      censor: "[REDACTED]",
    },
  };

  if (pretty) {
    options.transport = {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss.l" },
    };
  }

  return pino(options);
}

export function runWithContext<T>(ctx: LogContext, fn: () => T): T {
  return als.run(ctx, fn);
}

export function getContext(): LogContext | undefined {
  return als.getStore();
}

export function mergeContext(patch: Partial<LogContext>): void {
  const current = als.getStore();
  if (current) Object.assign(current, patch);
}

export type { Logger } from "pino";
