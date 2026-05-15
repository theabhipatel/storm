# Day 10 — Observability, Security Hardening, AWS Deploy

**Goal:** Production-shape: full observability, security headers + rate limits, mTLS via Linkerd, deployed to AWS dev environment via GitOps, smoke test passing on AWS.

**Depends on:** Days 1–9.

---

## Observability — Instrumentation

### OpenTelemetry SDK (every backend service)
- Auto-instrumentation for: HTTP (Express), Postgres (Prisma), Redis (ioredis), Kafka (KafkaJS), gRPC, MongoDB, OpenSearch, AWS SDK
- Manual span creation for: business operations (place order, reserve inventory, etc.)
- Trace context propagated via:
  - HTTP: `traceparent` header (W3C)
  - gRPC: metadata
  - Kafka: message header `traceparent`
- Resource attributes: `service.name`, `service.version` (commit SHA), `deployment.environment`

### Structured logs (every service)
- pino with required fields per `docs/observability-standards.md` §3
- `traceId` and `spanId` auto-injected from OTel context
- Level: INFO in dev/staging, INFO + sampled DEBUG in prod
- Never log: tokens, passwords, OTPs, full PII payloads

### Metrics
- RED per service (rate, errors, duration histograms with p50/p95/p99 buckets)
- USE per resource: DB connection pool, Redis memory, Kafka consumer lag, OpenSearch query queue
- Custom business metrics: orders/minute, payment success rate, search latency, low-stock count

---

## Observability — Stack

### Deployed to cluster (Helm charts)
- Prometheus + Prometheus Operator
- Grafana
- Loki (S3 chunk storage in prod; PVC locally)
- Tempo (S3 trace storage in prod; PVC locally)
- OpenTelemetry Collector (DaemonSet on every node)
- Alertmanager

### Dashboards (committed JSON)
- "Service health" — RED per service
- "Resource health" — USE per resource
- "Business KPIs" — orders/hour, GMV, payment success %, top errors
- "Saga health" — order placement step latencies, compensation rate, DLQ growth
- Per-service drill-down dashboards

### Alert rules
| Alert | Condition | Severity |
|---|---|---|
| High error rate | service error rate > 5% for 5 min | page |
| p99 latency breach | service p99 > 500ms for 10 min | page |
| Payment success rate | < 95% over 10 min | page |
| Kafka consumer lag | > 10000 messages | page |
| DLQ growth | any DLQ topic grows > 100/min | page |
| Low stock count | > 50 SKUs in low-stock state | warn |
| Pod restart loop | > 3 restarts in 10 min | warn |
| Disk usage | RDS / EBS > 80% | warn |

Runbook link required on every page-level alert.

### Sentry (frontend)
- SDKs in both `apps/web` and `apps/admin`
- Source maps uploaded in CI
- Release tagging per deploy
- User context (userId, not email) attached to events
- PII scrubbing rules

---

## Security Hardening

### Headers (both apps, via Next.js middleware / Vite SSR or Kong)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` with nonce-based script-src; no unsafe-inline, no unsafe-eval
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`

### CORS
- Locked allowlist: only `web.storm.example` and `admin.storm.example` origins
- `Access-Control-Allow-Credentials: true` only on `/api/auth/*`

### Kong rate-limit policies
- Login: 5/IP/15min, 10/email/h
- Signup: 5/IP/h
- OTP send: 3/email/h
- Refresh: 60/IP/h
- Search: 600/IP/min
- Add to cart: 30/user/min
- Place order: 10/user/min
- Default: 600/IP/min
- Headers in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` on 429

### WAF rules (AWS)
- AWS Managed Rules: Core Rule Set, Known Bad Inputs, SQL injection, Linux/Unix injection
- Custom: Razorpay webhook IP allowlist for `/webhooks/razorpay`
- Rate-limit at edge: 2000 req/5min per IP (anti-bot)

### Vulnerability response process
- Trivy scan in CI; block on critical CVEs
- Renovate / Dependabot for non-breaking dep updates (auto-merge if CI passes)
- SBOM generated per release

### Secrets
- All runtime secrets in AWS Secrets Manager
- External Secrets Operator syncs to K8s Secrets
- No secret in any image, env file in repo, or `kubectl` history
- Secret rotation policy: webhook secrets quarterly; JWT keys annually with rolling window

---

## Service Mesh — Linkerd

### Installation
- Linkerd 2.x via Helm into cluster
- Linkerd-viz extension for mesh dashboards

### Configuration
- All application namespaces auto-injected
- mTLS enforced between meshed services
- Service profiles for each backend service (timeouts, retries declared at mesh level — complementary to in-app circuit breakers)
- Linkerd golden metrics integrated into Grafana via Prometheus federation

---

## AWS Infrastructure (Terraform)

### Modules in `infra/terraform/`
| Module | Resources |
|---|---|
| `network` | VPC, 3 AZ subnets (public + private-app + private-data), IGW, 3 NAT GWs, route tables, VPC endpoints (S3, ECR, Secrets Manager) |
| `eks` | EKS cluster + 3 node groups (`system`, `general`, `spot`); IRSA OIDC provider; cluster autoscaler IAM |
| `rds` | 7 Postgres clusters per `design/aws-topology.md` §4.1: identity, catalog, inventory, order, payment, wishlist, media |
| `mongodb` | DocumentDB cluster for notification logs |
| `redis` | ElastiCache cluster-mode (3 shards × 2 replicas) |
| `msk` | 3-broker MSK cluster |
| `opensearch` | Managed OpenSearch cluster (3 data + 3 master) |
| `s3` | Buckets: `storm-media-prod`, `storm-invoices-prod`, `storm-backups-prod`, `storm-logs-prod` (KMS-encrypted) |
| `cloudfront` | Distribution in front of media bucket + customer app |
| `waf` | WebACL with managed + custom rules |
| `alb` | ALB in public subnets, ACM cert, target group to Kong NodePort |
| `route53` | DNS records for `storm.example`, `web.storm.example`, `admin.storm.example`, `api.storm.example` |
| `acm` | TLS certificates |
| `secrets-manager` | Secrets created; values populated out-of-band |
| `iam` | One IAM role per service (IRSA) with least-privilege policies |

### State management
- Terraform state in S3 bucket with versioning
- DynamoDB lock table

### Environments
- `infra/terraform/envs/dev/` and `.../staging/`, `.../prod/`
- Day 10 covers `dev` only; staging + prod come later (separate cycle)

---

## CI/CD — GitOps

### CI (GitHub Actions)
- Per-service workflows (already from Day 1)
- On merge to `main`:
  - Build image, tag with commit SHA, sign with Cosign
  - Push to ECR
  - Bump image tag in `infra/argocd/dev/<service>.yaml`
  - Commit + push to GitOps repo path
- OIDC token exchange → assumes AWS IAM role per repo (no long-lived AWS keys in GitHub Secrets)

### ArgoCD
- Bootstrap installation on EKS cluster
- App-of-apps pattern: one root Application points at `infra/argocd/dev/` directory
- Each service has its own Application resource with sync policy: automated, prune, self-heal
- Health checks on Deployments, StatefulSets, Services
- Notifications: Slack / email on sync failure

### External Secrets Operator
- ClusterSecretStore pointing at AWS Secrets Manager
- Per-service ExternalSecret resources mapping AWS secrets → K8s Secrets

### Image signing
- Cosign keyless signing via OIDC
- Admission policy (cosign policy-controller) verifies signatures before pod admission

---

## First AWS Deploy

### Steps
1. Provision Terraform `dev` env
2. Configure DNS + ACM
3. Push first images to ECR
4. Populate AWS Secrets Manager with placeholder secrets
5. ArgoCD bootstrap + first sync
6. Verify all pods healthy
7. Run smoke test (Playwright headless) against `web.storm.dev.example`
8. Verify Razorpay webhook reachable on AWS (use Razorpay test mode)

### Smoke test (subset of Playwright golden path)
- Anonymous browse home, product detail, search
- Signup new test user
- Add to cart, checkout with Razorpay test card
- Order confirmed
- Admin login + view the order

---

## Execution Order
1. OpenTelemetry SDK + collector + auto-instrumentation per service
2. Prometheus / Grafana / Loki / Tempo via Helm
3. Dashboards + alert rules
4. Sentry frontend integration
5. Security headers across both apps
6. CSP nonce wiring (Next.js + Vite)
7. Kong rate-limit policies + WAF rules
8. Linkerd install + mesh injection
9. Terraform modules (network → IAM → data stores → EKS)
10. `terraform apply` to dev account
11. ECR repos + first image push
12. ArgoCD bootstrap + app registration
13. First reconcile
14. Smoke test on AWS dev
15. Final documentation pass

---

## Definition of Done

| Check |
|---|
| Trace for "signup → checkout" visible end-to-end in Tempo |
| Logs queryable in Loki with `traceId` filter |
| Sentry receives a deliberate frontend error with sourcemap-resolved stack |
| All RED + USE dashboards show data for live local traffic |
| Linkerd mesh shows mTLS for all inter-service traffic |
| Mozilla Observatory grade ≥ A on both apps |
| Razorpay webhook works on AWS dev |
| `terraform apply` completes idempotently |
| ArgoCD shows all apps healthy + synced |
| Cosign signature required for pod admission; unsigned image rejected |
| Playwright smoke test passes against AWS dev |
| No long-lived AWS credentials in GitHub Actions |
| All secrets in AWS Secrets Manager; none in repo or images |
| At least one alert rule fires correctly in a deliberate test |

---

## Out of scope today (explicitly deferred)
- Staging + prod environments (separate cycle)
- Multi-region (Stage 3)
- Canary deployments (later)
- Load testing at scale (separate cycle)
- India compliance — GST, DPDP, Twilio DLT (separate compliance cycle, deferred per user direction)
- Reviews, refunds, multi-vendor (Stage 2)
- Mobile apps (Stage 2)

---

## Stage 1 Complete

After Day 10, the system has:
- All Stage 1 capabilities working end-to-end
- Both apps polished, India-formatted, accessibility-checked
- Full observability (traces, metrics, logs, RUM)
- Security headers, rate limits, mTLS via Linkerd
- Deployed to AWS dev environment via GitOps with image signing
- The architectural foundation to scale to billions per the design — without rewrites
