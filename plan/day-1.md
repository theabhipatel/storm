# Day 1 — Foundation, Tech Choices, Local Infrastructure

**Goal:** Monorepo skeleton, locked tech choices, every service scaffolded as a bootable stub, local infra running, CI green.

**Depends on:** Nothing.

---

## Locked Tech Choices (apply to all services & apps)

| Concern | Choice |
|---|---|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5.x (strict) |
| Backend framework | Express 4.x |
| Frontend (customer) | Next.js 14 (App Router) + TypeScript |
| Frontend (admin) | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Workspaces | pnpm + Turborepo |
| ORM | Prisma (one schema + client per service) |
| Migrations | Prisma migrate |
| Validation | Zod (shared between FE + BE where possible) |
| Forms | React Hook Form + Zod resolver |
| State (frontend) | Redux Toolkit + RTK Query |
| HTTP client | axios |
| Logger | pino (structured JSON) |
| Test runner | Vitest |
| E2E | Playwright |
| JWT lib | `jose` |
| Password hashing | `argon2` |
| Kafka client | KafkaJS |
| gRPC | `@grpc/grpc-js` + `@grpc/proto-loader` |
| Redis client | ioredis (cluster-aware) |
| MongoDB driver | `mongodb` (no Mongoose) |
| OpenSearch client | `@opensearch-project/opensearch` |
| AWS SDK | v3 (`@aws-sdk/client-*`) |
| Razorpay SDK | `razorpay` (official Node SDK) |
| Twilio SDK | `twilio` (official Node SDK) |
| Image processing | `sharp` |
| PDF (invoices) | `pdfkit` |
| Container | Docker (Alpine base for Node) |
| API gateway | Kong |
| Service mesh | Linkerd |
| CI | GitHub Actions |
| GitOps | ArgoCD |
| Cloud | AWS (`ap-south-1`) |
| IaC | Terraform |

---

## Deliverables

### Repo & tooling
- Root: `pnpm-workspace.yaml`, `turbo.json`, `package.json`, `.npmrc`, `.gitignore`, `README.md`
- Shared packages (skeletons):
  - `packages/tsconfig` — base `tsconfig.json` (strict, target ES2022)
  - `packages/eslint-config` — shared ESLint rules + import-restriction rules per `design/repo-bootstrap.md` §7
  - `packages/logger` — pino logger with required fields per `docs/observability-standards.md` §3
  - `packages/contracts` — folders: `events/`, `dto/`, `proto/`, `errors/`
  - `packages/middlewares` — shared Express middleware: error handler, request logger (correlation + trace IDs), auth context (reads gateway-injected headers), idempotency key middleware

### Common error response shape (defined in `packages/contracts/errors`)
- `{ error: { code, message, details?, requestId } }` per `docs/api-conventions.md` §6
- Initial error code catalog file (`packages/contracts/errors/codes.ts`) — populated incrementally as days progress

### Services scaffolded (13 backend + 2 BFF = 15)
Each service has identical shape:
```
services/<name>/
├── prisma/                       # only if Postgres-backed
│   └── schema.prisma             # empty schema header, datasource + generator only
├── src/
│   ├── index.ts                  # entry — loads config, starts server
│   ├── server.ts                 # Express setup, /health, /ready, middleware chain
│   ├── config.ts                 # env-driven config via Zod
│   ├── routes/                   # empty for now
│   ├── handlers/                 # empty
│   ├── services/                 # empty (domain logic)
│   ├── repositories/             # empty (DB access)
│   ├── events/                   # empty (producers/consumers)
│   └── grpc/                     # only if service exposes gRPC (inventory)
├── tests/{unit,integration}/
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

Services to create: `identity`, `catalog`, `search`, `inventory`, `cart`, `order`, `payment`, `wishlist`, `recommendation`, `notification`, `media`, `web-bff`, `admin-bff`.

### Standard endpoints (every service)
- `GET /health` — returns `{ status: "ok" }` if process is alive (used by liveness probe)
- `GET /ready` — checks critical deps (DB, Redis if used); returns `{ status: "ready" }` or 503 (used by readiness probe)

### Apps scaffolded (2)
- `apps/web`:
  - Next.js App Router, TypeScript, Tailwind, shadcn/ui base
  - Folders: `app/`, `components/{ui,domain}/`, `features/`, `lib/`, `store/`, `public/`
  - Placeholder home page rendering "Storm — coming soon"
  - Redux store stub, axios + baseQuery stub
- `apps/admin`:
  - Vite + React + TypeScript, Tailwind, shadcn/ui
  - Placeholder home page
  - Same Redux + axios stub

### Local infrastructure (`docker-compose.yml` at repo root)
- Postgres 16 — one container, init script creates 7 separate databases with separate users + grants (least-privilege): `identity`, `catalog`, `inventory`, `order`, `payment`, `wishlist`, `media`
- MongoDB init creates database `notification` for notification-service logs
- Redis 7 (single node, AOF + RDB persistence enabled)
- Redpanda (Kafka-compatible, simpler than Kafka + Zookeeper) + Schema Registry
- OpenSearch 2.x (single node, security disabled for local)
- MongoDB 7
- MinIO (S3-compatible, single bucket `storm-media`)
- Mailhog (local SMTP for SES-substitute during dev)
- Dev convenience: pgAdmin, RedisInsight, Redpanda Console

### DB migration setup
- Prisma installed per Postgres-backed service
- `pnpm db:migrate` script per service (runs `prisma migrate dev` locally)
- Each `schema.prisma` starts with datasource + generator only; entities added on owning service's day

### Seed data infrastructure
- `scripts/seed/` directory at repo root
- Per-service seed script stub (`scripts/seed/<service>.ts`) — populated on owning service's day
- `pnpm seed:all` runs all seed scripts in dependency order

### CI workflow
- `.github/workflows/ci.yml` — path-filtered per workspace
- Stages: install (cached) → lint → unit test → build → docker build → Trivy scan
- One workflow handles all workspaces via Turborepo filtering

---

## Execution Order

1. Root config + pnpm workspace
2. Shared packages (tsconfig, eslint-config, logger, middlewares, contracts)
3. Service template — fully working `identity-service` with `/health` + `/ready`
4. Copy template to 12 other services + 2 BFFs (stub only)
5. `apps/web` scaffold
6. `apps/admin` scaffold
7. `docker-compose.yml` with all infra + init scripts
8. Migration tooling + seed directory
9. CI workflow + sample PR

---

## Definition of Done

| Check |
|---|
| `pnpm install` at root succeeds |
| `pnpm turbo build` builds every workspace |
| `pnpm turbo lint` passes |
| `pnpm turbo test` passes (one placeholder test per workspace) |
| `docker-compose up -d` brings all infra healthy |
| 7 Postgres databases exist with separate users + grants |
| All 15 services boot; `/health` returns 200; `/ready` returns 200 with deps available |
| `apps/web` and `apps/admin` boot and render placeholder pages |
| CI workflow runs green on a sample PR touching one service |

---

## Out of scope today
- Any business logic (starts Day 2)
- Kong gateway (Day 2)
- AWS infra (Day 10)
- Linkerd (Day 10)
