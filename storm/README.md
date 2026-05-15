# Storm

Flipkart-style e-commerce platform (Stage 1 — single-seller, India).

## Prerequisites

- Node.js 20 LTS
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- Docker + Docker Compose v2

## Quick start

```bash
pnpm install
pnpm infra:up          # start local infra (Postgres, Redis, Redpanda, OpenSearch, Mongo, MinIO, Mailhog)
pnpm turbo build
pnpm turbo test
pnpm turbo lint
```

## Layout

| Path | Purpose |
|---|---|
| `apps/web` | Next.js customer app |
| `apps/admin` | Vite + React admin app |
| `services/*` | 13 backend services + 2 BFFs |
| `packages/*` | Shared libraries (tsconfig, eslint, logger, contracts, middlewares) |
| `infra/` | Terraform, k8s manifests, ArgoCD configs (filled in Day 10) |
| `scripts/seed/` | Per-service seed scripts (filled as services come online) |

See [`plan/`](./plan) for the day-by-day build plan and [`design/`](./design) for architecture.
