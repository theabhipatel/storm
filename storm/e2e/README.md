# Storm E2E

Playwright tests for the customer (`apps/web`) and admin (`apps/admin`) apps.

## Prerequisites

- `docker-compose up -d` from `storm/` to bring up Postgres, Redis, OpenSearch,
  Mailhog, Redpanda, etc.
- `pnpm dev` for `@storm/web` (port 3200), `@storm/admin` (port 3300), all
  microservices.
- Optional env vars:
  - `E2E_WEB_URL` (default `http://localhost:3200`)
  - `E2E_ADMIN_URL` (default `http://localhost:3300`)
  - `MAILHOG_URL` (default `http://localhost:8025`)
  - `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` — verified customer for smoke tests
  - `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` — admin user for admin smoke tests

## Run

```bash
cd e2e
pnpm install
pnpm playwright install --with-deps chromium
pnpm test            # all tests
pnpm test:golden     # golden-path only
pnpm test:smoke      # smoke tests
```

## Artefacts

On failure, screenshots, traces and videos are saved to `e2e-artifacts/`.
Zero retries — flaky tests get fixed, not retried.
