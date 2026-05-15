# Storm — Project Rules for Claude

## What this project is
Stage 1 of a Flipkart-style e-commerce platform for India (single-seller). Microservices from day one, designed to scale to billions. Stack: Node + Express + TypeScript backend; Next.js customer app + React/Vite admin; Postgres + Redis + OpenSearch + Kafka (Redpanda locally / MSK on AWS) + MongoDB. Deployed on AWS via Docker + EKS + ArgoCD + Terraform.

## Sources of truth (read these, never change unless told)

| File / Folder | Purpose |
|---|---|
| `requirement.md` | High-level requirements. **Do not edit.** |
| `docs/` | Generic architecture playbook (auth, API, events, caching, etc.). **Do not edit.** |
| `design/` | Project-specific design (services, sagas, AWS, etc.). **Do not edit.** |
| `plan/day-1.md` … `day-10.md` | The build plan. **Do not edit.** |

**Hard rule:** never modify any file in `requirement.md`, `docs/`, `design/`, or `plan/` unless the user explicitly says "update X". For every other change, ask first.

## How to work each day

1. Read the current day's plan file in full
2. Read every design doc and generic doc it references
3. Build exactly what the day's "Deliverables" list says — nothing more, nothing less
4. Stop when the "Definition of Done" checklist is satisfied
5. If something seems missing or ambiguous, ask before adding it

## Coding rules

| Concern | Rule |
|---|---|
| Tech choices | Pinned in `plan/day-1.md`. Use those libraries; never substitute |
| TypeScript | Strict mode, no `any` without justification |
| Logger | Always `@storm/logger` (pino). Never `console.log` in committed code |
| HTTP client (frontend) | Always the single axios instance with interceptors. Never create a second |
| Errors | Always the standard shape: `{ error: { code, message, details?, requestId } }` |
| IDs | UUID v7 |
| Money | Integer paise + currency code (`INR`). Never floats |
| Timestamps | ISO 8601 UTC; display in IST on UI |
| JSON keys | camelCase |
| Mutations | Always require `Idempotency-Key`; server stores 24h dedup |
| Events | Producer uses transactional outbox; consumers dedup by `eventId` |
| Cross-service data | Never query another service's DB directly — REST, gRPC, or events only |
| Secrets | Never in code, env files in repo, or images. AWS Secrets Manager → External Secrets Operator |
| Validation | Zod schemas; shared between FE + BE via `packages/contracts` where possible |

## Daily working flow

| Phase | Action |
|---|---|
| Before coding | Read day plan + referenced design docs + relevant `docs/` files |
| During | Track work via TodoWrite; small commits; test as you go |
| Before claiming done | Run lint + tests; verify every DoD checkbox; test UI changes in a browser if applicable |
| Reporting | Short status; what works, what failed, next step |

## Communication style

- **Default to very short answers.** A few lines, plain language.
- Expand into tables/long explanations **only when asked** ("explain", "in detail", "deep dive").
- No emojis unless asked.
- State decisions directly. Skip narration of internal reasoning.
- For exploratory questions, propose a recommendation in 2–3 sentences and let the user redirect.

## Out of scope reminders

Do **not** add (Stage 2+):
- Reviews / ratings, refunds, multi-vendor, coupons, wallet
- Returns, delivery integration, live tracking, customer support
- Push notifications, mobile apps, multi-region
- GST / DPDP / DLT compliance (user explicitly deferred)

Do **not** add features not in the current day's plan — even small "nice to haves". If the user asks for one mid-day, surface it as a scope change.

## Branching & deploys

- Trunk-based: single `main` branch, short-lived `feat/`, `fix/`, `chore/`, `hotfix/` branches
- No `dev`, `staging`, or `prod` branches — environments differ by `infra/argocd/<env>/` directory
- Promotion = PR that bumps the image tag in `infra/argocd/<env>/<service>.yaml`

## What to ask the user when blocked

Ask, don't guess, when:
- A library version pinned in `day-1.md` is unavailable
- A design doc contradicts the day plan
- A required external credential (Razorpay test keys, Twilio creds, AWS keys) is missing
- Scope creep is requested mid-day
- Destructive action is needed (DB drop, force-push, revert to prior commit)

## Memory of past decisions

- Choreography (not orchestration) for the order saga compensation phase
- Cart is Redis-only with AOF + RDB persistence — no Postgres mirror
- One database per service — never share clusters across services
- Linkerd is the service mesh
- OTP and all transactional messaging routes via events to notification-service — never a direct Twilio call from identity-service
- Token-version check at Kong = local cache + Redis pub-sub, not Redis per request
