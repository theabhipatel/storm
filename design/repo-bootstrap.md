# Repo Bootstrap

**Goal:** Get the Storm monorepo skeleton in place so service work can begin. No business logic — only the bones.

---

## 1. Stack

- pnpm workspaces + Turborepo
- Single GitHub monorepo
- Path-filtered CI per service/app
- Docker per service, image pushed to ECR (deploy via ArgoCD comes later)

---

## 2. Directory Tree

```
storm/
├── apps/
│   ├── web/                # Next.js customer app
│   └── admin/              # React + Vite admin app
├── services/
│   ├── identity/
│   ├── catalog/
│   ├── search/
│   ├── inventory/
│   ├── cart/
│   ├── order/
│   ├── payment/
│   ├── wishlist/
│   ├── recommendation/
│   ├── notification/
│   ├── media/
│   ├── web-bff/
│   └── admin-bff/
├── packages/
│   ├── contracts/          # TS types + event schemas + proto-generated types
│   ├── logger/             # Shared structured logger
│   ├── eslint-config/
│   └── tsconfig/
├── infra/
│   ├── terraform/
│   ├── k8s/
│   └── argocd/
├── .github/workflows/
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── .npmrc
```

---

## 3. Shared Packages

| Package | Exports |
|---|---|
| `contracts` | TS types for REST DTOs, Kafka event schemas, proto-generated gRPC types |
| `logger` | Structured JSON logger (pino) with required fields per [observability-standards.md](../docs/observability-standards.md) |
| `eslint-config` | Shared ESLint config; every package extends it |
| `tsconfig` | Base `tsconfig.json`; services and apps extend it |

---

## 4. Service Template

Every service has the same folder shape:

```
services/<name>/
├── src/
│   ├── index.ts            # entry
│   ├── server.ts           # Express bootstrap, /health, /ready
│   ├── routes/
│   ├── handlers/
│   ├── services/           # domain logic
│   ├── repositories/       # DB access
│   ├── events/             # Kafka producers/consumers
│   └── config.ts           # env-driven config
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 5. App Template

| App | Bootstrapped with |
|---|---|
| `apps/web` | Next.js (App Router) + TypeScript + Tailwind + Redux Toolkit + axios per [frontend-state-management.md](../docs/frontend-state-management.md) |
| `apps/admin` | Vite + React + TypeScript + Tailwind + same Redux/axios setup |

---

## 6. CI Workflow Shape (per service / app)

| Stage | Action |
|---|---|
| Trigger | PR + push to `main`, path-filtered |
| Install | `pnpm install --frozen-lockfile` (cached) |
| Lint | `pnpm turbo lint --filter=<name>` |
| Test | `pnpm turbo test --filter=<name>` (unit only in CI; integration nightly) |
| Build | `pnpm turbo build --filter=<name>` |
| Docker | Build image, tag with commit SHA |
| Scan | Trivy on the image; fail on critical CVEs |
| Push | To ECR (on `main` only) |
| GitOps bump | Update image tag in `infra/argocd/<env>/<service>.yaml` |

---

## 7. Decoupling Rules (Enforced)

| Rule | Enforcement |
|---|---|
| No service imports another service's `src/` | ESLint `no-restricted-imports` |
| Only `packages/*` may be imported across services | Same |
| No cross-app imports between `apps/web` and `apps/admin` | Same |
| Each service has its own `package.json` and dependencies | Workspace boundary |

---

## 8. Definition of Done

| Check |
|---|
| `pnpm install` at root succeeds |
| `pnpm turbo build` builds every workspace |
| `pnpm turbo lint` passes |
| `pnpm turbo test` passes (one example test per service stub) |
| `docker build` succeeds for `identity-service` and `apps/web` |
| CI workflow runs green on a sample PR |
| `apps/web` boots and shows a placeholder page |
| `apps/admin` boots and shows a placeholder page |
| `identity-service` boots and `/health` returns 200 |

---

## 9. Sequencing (Day 1)

1. Root config + shared package skeletons
2. Scaffold `identity-service` end-to-end (boots, `/health`, Docker image)
3. Scaffold `apps/web` and `apps/admin` (boot, show placeholder)
4. CI workflow proven green on a sample PR
5. Copy service template to remaining 12 services as stubs (boots + `/health` only)
