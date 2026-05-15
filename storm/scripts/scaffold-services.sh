#!/usr/bin/env bash
# Generates Day-1 stub services from the identity-service template.
# Idempotent: re-running overwrites files. Run from repo root.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# name|port|hasPostgres|hasGrpc|hasRedis
SERVICES=(
  "catalog|3002|true|false|false"
  "search|3003|false|false|false"
  "inventory|3004|true|true|true"
  "cart|3005|false|false|true"
  "order|3006|true|false|true"
  "payment|3007|true|false|true"
  "wishlist|3008|true|false|false"
  "recommendation|3009|false|false|false"
  "notification|3010|false|false|false"
  "media|3011|true|false|false"
  "web-bff|3000|false|false|true"
  "admin-bff|3100|false|false|false"
)

for entry in "${SERVICES[@]}"; do
  IFS='|' read -r NAME PORT HAS_PG HAS_GRPC HAS_REDIS <<<"$entry"
  DIR="services/$NAME"
  echo "  → scaffolding $NAME (port $PORT, pg=$HAS_PG, grpc=$HAS_GRPC)"
  mkdir -p "$DIR/src/routes" "$DIR/src/handlers" "$DIR/src/services" \
           "$DIR/src/repositories" "$DIR/src/events" \
           "$DIR/tests/unit" "$DIR/tests/integration"
  touch "$DIR/src/routes/.gitkeep" "$DIR/src/handlers/.gitkeep" \
        "$DIR/src/services/.gitkeep" "$DIR/src/repositories/.gitkeep" \
        "$DIR/src/events/.gitkeep" "$DIR/tests/integration/.gitkeep"

  if [[ "$HAS_GRPC" == "true" ]]; then
    mkdir -p "$DIR/src/grpc"
    touch "$DIR/src/grpc/.gitkeep"
  fi

  # package.json
  PG_DEPS=""
  PG_DEV_DEPS=""
  PG_SCRIPTS=""
  if [[ "$HAS_PG" == "true" ]]; then
    PG_DEPS=',
    "@prisma/client": "5.20.0"'
    PG_DEV_DEPS=',
    "prisma": "5.20.0"'
    PG_SCRIPTS=',
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy"'
  fi

  cat >"$DIR/package.json" <<EOF
{
  "name": "@storm/$NAME",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "lint": "eslint src --max-warnings=0",
    "test": "vitest run",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "clean": "rm -rf dist .turbo"$PG_SCRIPTS
  },
  "dependencies": {
    "@storm/contracts": "workspace:*",
    "@storm/logger": "workspace:*",
    "@storm/middlewares": "workspace:*",
    "express": "4.21.0",
    "zod": "3.23.8"$PG_DEPS
  },
  "devDependencies": {
    "@storm/tsconfig": "workspace:*",
    "@storm/eslint-config": "workspace:*",
    "@types/express": "4.17.21",
    "@types/node": "20.16.5",
    "@types/supertest": "6.0.2",
    "eslint": "8.57.1",
    "supertest": "7.0.0",
    "tsx": "4.19.1",
    "typescript": "5.5.4",
    "vitest": "2.1.1"$PG_DEV_DEPS
  }
}
EOF

  cat >"$DIR/tsconfig.json" <<EOF
{
  "extends": "@storm/tsconfig/node.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src/**/*"]
}
EOF

  cat >"$DIR/.eslintrc.cjs" <<'EOF'
module.exports = {
  root: true,
  extends: ["@storm/eslint-config/service.cjs"],
  parserOptions: { project: "./tsconfig.json", tsconfigRootDir: __dirname },
};
EOF

  cat >"$DIR/vitest.config.ts" <<'EOF'
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
EOF

  # .env.example
  {
    echo "NODE_ENV=development"
    echo "PORT=$PORT"
    echo "LOG_LEVEL=info"
    if [[ "$HAS_PG" == "true" ]]; then
      DB_NAME="${NAME//-/_}"
      echo "DATABASE_URL=postgresql://${NAME}:${NAME}@localhost:5432/${DB_NAME}?schema=public"
    fi
    if [[ "$HAS_REDIS" == "true" ]]; then
      echo "REDIS_URL=redis://localhost:6379/0"
    fi
    if [[ "$HAS_GRPC" == "true" ]]; then
      echo "GRPC_PORT=50051"
    fi
  } >"$DIR/.env.example"

  if [[ "$HAS_PG" == "true" ]]; then
    mkdir -p "$DIR/prisma"
    cat >"$DIR/prisma/schema.prisma" <<EOF
// $NAME service Prisma schema.
// Entities are added on the owning service's day.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
EOF
  fi

  # config.ts
  CONFIG_DB=""
  CONFIG_REDIS=""
  CONFIG_GRPC=""
  CONFIG_DB_LOAD=""
  CONFIG_REDIS_LOAD=""
  CONFIG_GRPC_LOAD=""
  if [[ "$HAS_PG" == "true" ]]; then
    DB_NAME="${NAME//-/_}"
    CONFIG_DB='
  databaseUrl: z.string().min(1),'
    CONFIG_DB_LOAD="
    databaseUrl: process.env[\"DATABASE_URL\"] ?? \"postgresql://${NAME}:${NAME}@localhost:5432/${DB_NAME}?schema=public\","
  fi
  if [[ "$HAS_REDIS" == "true" ]]; then
    CONFIG_REDIS='
  redisUrl: z.string().min(1).optional(),'
    CONFIG_REDIS_LOAD='
    redisUrl: process.env["REDIS_URL"],'
  fi
  if [[ "$HAS_GRPC" == "true" ]]; then
    CONFIG_GRPC='
  grpcPort: z.coerce.number().int().positive().default(50051),'
    CONFIG_GRPC_LOAD='
    grpcPort: process.env["GRPC_PORT"],'
  fi

  cat >"$DIR/src/config.ts" <<EOF
import { z } from "zod";

const ConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default($PORT),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),$CONFIG_DB$CONFIG_REDIS$CONFIG_GRPC
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  return ConfigSchema.parse({
    nodeEnv: process.env["NODE_ENV"],
    port: process.env["PORT"],
    logLevel: process.env["LOG_LEVEL"],$CONFIG_DB_LOAD$CONFIG_REDIS_LOAD$CONFIG_GRPC_LOAD
  });
}

export const SERVICE_NAME = "$NAME";
EOF

  cat >"$DIR/src/server.ts" <<'EOF'
import express, { type Express } from "express";
import {
  requestContext,
  requestLogger,
  authContext,
  errorHandler,
  notFoundHandler,
} from "@storm/middlewares";
import type { Logger } from "@storm/logger";

import { SERVICE_NAME } from "./config.js";

export interface ReadyChecks {
  [name: string]: () => Promise<boolean>;
}

export function createServer(opts: { logger: Logger; readyChecks?: ReadyChecks }): Express {
  const app = express();
  const { logger, readyChecks = {} } = opts;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(requestContext());
  app.use(requestLogger(logger));
  app.use(authContext());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: SERVICE_NAME });
  });

  app.get("/ready", async (_req, res) => {
    const results: Record<string, "ok" | "fail"> = {};
    let allOk = true;
    for (const [name, check] of Object.entries(readyChecks)) {
      try {
        const ok = await check();
        results[name] = ok ? "ok" : "fail";
        if (!ok) allOk = false;
      } catch {
        results[name] = "fail";
        allOk = false;
      }
    }
    if (allOk) {
      res.status(200).json({ status: "ready", checks: results });
    } else {
      res.status(503).json({ status: "not_ready", checks: results });
    }
  });

  app.use(notFoundHandler());
  app.use(errorHandler(logger));

  return app;
}
EOF

  cat >"$DIR/src/index.ts" <<'EOF'
import { createLogger } from "@storm/logger";

import { loadConfig, SERVICE_NAME } from "./config.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger({
    service: SERVICE_NAME,
    level: config.logLevel,
    pretty: config.nodeEnv !== "production",
  });

  const app = createServer({ logger });

  const server = app.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, "service_started");
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, "shutdown_requested");
    server.close((err) => {
      if (err) {
        logger.error({ err }, "shutdown_failed");
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("fatal startup error", err);
  process.exit(1);
});
EOF

  cat >"$DIR/tests/unit/health.test.ts" <<EOF
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createLogger } from "@storm/logger";

import { createServer } from "../../src/server.js";

describe("$NAME service health endpoints", () => {
  const logger = createLogger({ service: "$NAME-test", pretty: false, level: "error" });
  const app = createServer({ logger });

  it("GET /health returns 200 ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /ready returns 200 ready when no checks registered", async () => {
    const res = await request(app).get("/ready");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
  });
});
EOF

  cat >"$DIR/Dockerfile" <<EOF
# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/$NAME ./services/$NAME

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @storm/$NAME... build

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo /repo
WORKDIR /repo/services/$NAME

EXPOSE $PORT
USER node
CMD ["node", "dist/index.js"]
EOF
done

echo "done."
