# Storm

Flipkart-style e-commerce platform (Stage 1 — single-seller, India).

## Prerequisites

- Node.js 20 LTS
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- Docker + Docker Compose v2

## Quick start — one command, full stack

```bash
docker compose up --build
```

That builds and runs everything (infra + init + 13 services + 2 apps). First run takes ~10 min; subsequent runs are cached.

Then open:

| URL | What |
|---|---|
| http://localhost:3200 | Customer web (Next.js) |
| http://localhost:3300 | Admin (Vite SPA via nginx) |
| http://localhost:8025 | Mailhog inbox (verification + transactional emails) |
| http://localhost:18080 | Redpanda console (Kafka topics) |
| http://localhost:5050 | pgAdmin (login: dev@storm.dev / pgadmin) |
| http://localhost:5540 | RedisInsight |
| http://localhost:9001 | MinIO console (minio / minio12345) |
| http://localhost:8000 | Kong proxy (API gateway) |

Default admin login:  `admin@storm.local`  /  `AdminPass1!Storm`

Razorpay test keys (only needed for actual checkout payment) — drop into a `.env` next to `docker-compose.yml`:

```env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
```

Stop everything:

```bash
docker compose down            # keep data volumes
docker compose down -v         # nuke data too (fresh start)
```

## Dev mode (hot reload, no Docker for code)

```bash
pnpm install
pnpm infra:up                  # infra only — Postgres, Redis, Redpanda, etc.
pnpm dev                       # all 13 services + 2 apps with watch mode
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
