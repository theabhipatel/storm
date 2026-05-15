# Storm — E-commerce Platform Requirements (Stage 1)

**Status:** Draft v1 (high-level)
**Scope:** Stage 1 only. Stage 2 features are listed under "Out of Scope" for reference.

---

## 1. Vision

Storm is a Flipkart-style e-commerce platform built as a microservices system from day one, designed to scale from hundreds to billions of users without architectural rewrites. Stage 1 delivers core e-commerce functionality for an India-only, single-seller marketplace. Subsequent stages layer on multi-vendor, advanced personalization, returns, customer support, and global expansion.

Architectural non-negotiables:

- Microservices with strict service boundaries — each service owns its data, no shared databases
- Independently deployable, independently scalable
- Infrastructure as code, GitOps-driven deployments
- Observability and security baked in from the start

---

## 2. Scope

### 2.1 In Scope (Stage 1)

- Customer signup/login (email + password, Google OAuth) with optional verified mobile number
- Product browsing, search, filtering, product detail pages
- Wishlist
- Shopping cart
- Checkout with Razorpay (UPI Collect / Intent / QR, debit/credit cards, net banking, wallets)
- Order placement and history
- Admin-driven order status updates
- Email and SMS notifications for transactional events (signup, OTP, order placed, status changes)
- Rule-based "you might also like" recommendations
- Full admin dashboard for catalog, inventory, orders, and users
- Product image upload and delivery via S3 + CloudFront

### 2.2 Out of Scope (deferred to Stage 2+)

- Multi-vendor / seller onboarding
- Reviews and ratings
- Coupons, offers, wallet
- Returns and refunds
- ML-based personalization
- Delivery partner integration / live order tracking
- Customer support chat / ticketing
- Push notifications, mobile apps
- Multi-currency, multi-language, multi-region

---

## 3. User Roles (Stage 1)

| Role | Description |
|---|---|
| **Customer** | Browses, purchases, manages wishlist, profile, orders |
| **Admin** | Manages catalog, inventory, orders, users via admin dashboard |

Role is modeled as an attribute inside the Identity Service so future roles (seller, support, delivery partner) require schema changes only, not re-architecture.

---

## 4. Technology Stack

### 4.1 Frontend

| App | Framework | Reason |
|---|---|---|
| **Customer web** | Next.js + TypeScript | SSR/SSG for SEO, performance, dynamic routing |
| **Admin dashboard** | React + Vite + TypeScript | Internal app, no SEO needed, fast HMR for dev velocity |

Always use the latest **stable, production-proven** versions. Avoid versions released within the last 4–6 weeks until ecosystem support catches up.

### 4.2 Backend

- **Runtime:** Node.js (current LTS)
- **Framework:** Express + TypeScript
- **Inter-service sync:** REST (default), gRPC (latency-critical hot paths such as order → inventory reservation)
- **Inter-service async:** Apache Kafka (AWS MSK managed)

### 4.3 Data Storage Strategy

Each service owns its database. No service queries another service's database directly.

| Store | Use |
|---|---|
| **PostgreSQL** | Default for relational, transactional data — identity, catalog, inventory, orders, payments, wishlist |
| **MongoDB** | Document/log-shaped data — notification delivery logs |
| **Redis** | Sessions, OTP cache, hot caches, cart primary store, recommendation cache |
| **OpenSearch (AWS managed)** | Product full-text search, faceting, autocomplete |
| **S3 + CloudFront** | Media storage and global edge delivery |

**Why Postgres dominates:** JSONB closes the schema-flexibility gap with MongoDB, while preserving ACID, foreign keys, and superior analytical querying.

**Why managed OpenSearch:** Self-hosted Elasticsearch on EC2 is cheaper but requires dedicated SRE expertise at scale. Managed cost is justified until cluster spend exceeds ~$20k/month — at which point self-hosting will be revisited.

### 4.4 Third-Party Services

| Concern | Provider |
|---|---|
| **Payments** | Razorpay (single integration covers UPI, cards, net banking, wallets) |
| **Email** | AWS SES |
| **SMS / OTP** | Twilio |
| **Object storage** | AWS S3 |
| **CDN** | AWS CloudFront |

### 4.5 Infrastructure & DevOps

| Layer | Tool |
|---|---|
| **Cloud** | AWS, single region (`ap-south-1`) for Stage 1; multi-region in Stage 3 |
| **IaC** | Terraform (all AWS resources) |
| **Container registry** | AWS ECR |
| **Orchestration** | Kubernetes on AWS EKS |
| **GitOps deploys** | ArgoCD |
| **CI** | GitHub Actions (build, test, push to ECR) |
| **API Gateway** | Kong Gateway on K8s |
| **Service mesh** | Linkerd (mTLS service-to-service, lower ops cost than Istio at this scale) |
| **Edge** | CloudFront → AWS WAF → ALB → Kong |
| **Secrets** | AWS Secrets Manager + External Secrets Operator (K8s); GitHub OIDC for CI/CD (no long-lived AWS keys in GitHub Secrets) |

---

## 5. Microservices

### 5.1 Service Inventory

| Service | Responsibility | Primary DB | Secondary |
|---|---|---|---|
| **identity-service** | Signup, login, OAuth, JWT issuance, profile, mobile verification (OTP), RBAC | Postgres | Redis (sessions, OTP) |
| **catalog-service** | Products, categories, brands, attributes, variants | Postgres (JSONB) | — |
| **search-service** | Indexes catalog events into OpenSearch; serves search and filters | OpenSearch | — |
| **inventory-service** | Stock levels, checkout-time reservations | Postgres | Redis (hot cache) |
| **cart-service** | Per-user cart state | Redis (AOF + RDB persistence) | — |
| **order-service** | Order lifecycle, items, status transitions | Postgres | — |
| **payment-service** | Razorpay integration, payment records, webhook handling | Postgres | — |
| **wishlist-service** | User wishlists | Postgres | — |
| **recommendation-service** | Rule-based "you might also like" | Redis (cached suggestions) | — |
| **notification-service** | Email (SES) and SMS (Twilio) dispatch | MongoDB (logs) | Kafka (queue) |
| **media-service** | S3 presigned URLs, image upload, thumbnail jobs | Postgres (metadata) | S3 |

### 5.2 Backend-For-Frontend (BFF) Layer

| BFF | Serves |
|---|---|
| **web-bff** | Customer Next.js app — aggregates microservice calls, returns shape optimized for browsing/checkout |
| **admin-bff** | Admin React+Vite app — exposes admin-only fields and admin-only operations |

BFFs handle **business-level aggregation** (combining 4–5 service calls into one client response). Kong handles **infrastructure concerns** (auth, rate limiting, routing). They are complementary, not redundant.

### 5.3 Communication Patterns

| Pattern | Used For |
|---|---|
| **REST** | BFF ↔ services (read paths, simple CRUD) |
| **gRPC** | Service ↔ service hot paths where latency matters (order → inventory reserve, order → payment) |
| **Kafka events** | Catalog → Search indexing, Order → Notification, Order → Recommendation, Payment webhooks → Order status |

All cross-service requests carry a correlation ID (`traceparent`) for distributed tracing.

---

## 6. Repository & Code Structure

Single GitHub monorepo. Each subdirectory represents an independently buildable, dockerizable, deployable unit. Decoupling is enforced at runtime (own DB, own deploy pipeline) — not at repo boundary.

```
storm/
├── apps/
│   ├── web/                        # Next.js customer app
│   └── admin/                      # React + Vite admin dashboard
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
│   ├── contracts/                  # Shared TS types, event schemas, API DTOs
│   ├── logger/                     # Shared structured logger
│   ├── eslint-config/
│   └── tsconfig/
├── infra/
│   ├── terraform/                  # AWS infrastructure as code
│   ├── k8s/                        # Helm charts / manifests
│   └── argocd/                     # ArgoCD application definitions
└── .github/workflows/              # Path-filtered CI per service
```

**Tooling:** pnpm workspaces + Turborepo for incremental builds and caching. CI rebuilds only what changed.

**Decoupling rules (enforced):**

1. No direct database access across services
2. No shared business logic between services (only contracts, logger, configs)
3. Communication only via REST, gRPC, or Kafka
4. Each service has its own Dockerfile, package.json, tsconfig, deployment manifest

**Contracts strategy:** Stage 1 uses `packages/contracts` for hand-coordinated types. Migration trigger to a schema registry (Confluent or AWS Glue) is team size > 15 engineers.

---

## 7. Authentication & Authorization

- **Customer auth:** Email + password, Google OAuth
- **Mobile number:** Optional on profile, verified via OTP, **required at order placement**
- **Token strategy:** JWT (short-lived access token + refresh token in Redis)
- **Authorization:** RBAC inside Identity Service; role claims embedded in JWT
- **JWT validation:** Performed at Kong Gateway, propagated to services via headers

---

## 8. Observability

| Concern | Tool |
|---|---|
| **Metrics** | Prometheus → Grafana |
| **Logs** | Loki → Grafana (structured JSON logs from all services and frontends) |
| **Traces** | Tempo → Grafana, instrumented via OpenTelemetry |
| **Frontend errors / RUM** | Sentry |
| **Standard dashboards** | RED metrics (Rate, Errors, Duration) per service; USE metrics (Utilization, Saturation, Errors) per resource |

OpenTelemetry is the instrumentation standard across all services for vendor portability.

**Scale-out path:** When Prometheus single-node series count exceeds limits, migrate to **Grafana Mimir** or **Thanos** (Prometheus-compatible, S3-backed, horizontally scalable).

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **API latency** | p99 < 200ms |
| **Uptime** | 99.9% |
| **Scale** | Architecturally support millions to billions of users; stage out capacity per growth |
| **Region** | Stage 1: single region (`ap-south-1`); Stage 3: multi-region active-active |
| **Recovery** | RPO ≤ 15 min, RTO ≤ 1 hour for Stage 1 |
| **Security** | TLS everywhere, secrets never in Git, IAM least-privilege, DDoS via AWS Shield + WAF |
| **Compliance** | General good-practice security (no specific certifications required for Stage 1) |

---

## 10. Stage Roadmap (high-level)

| Stage | Focus |
|---|---|
| **Stage 1 (this doc)** | Core e-commerce, single seller, single region |
| **Stage 2** | Reviews & ratings, coupons, wallet, returns/refunds, ML-personalized recommendations, customer support, push notifications, mobile apps, delivery integration |
| **Stage 3** | Multi-vendor marketplace, multi-region, advanced fraud detection, internationalization |

---

## 11. Open Items for Next Brainstorm

The following deserve their own deep-dive sessions before implementation begins:

1. **Per-service detailed design** — entities, key APIs, event schemas per microservice
2. **Data model** — Postgres schemas, JSONB structures, OpenSearch index design
3. **Event catalog** — full list of Kafka topics, producers, consumers, payload shapes
4. **AWS infrastructure topology** — VPC layout, subnets, EKS node groups, RDS sizing, MSK sizing
5. **CI/CD pipeline design** — branching strategy, environments (dev/staging/prod), promotion flow, rollback
6. **Testing strategy** — unit, integration, contract testing (Pact?), E2E, load testing approach
7. **Local development experience** — how a developer runs the stack locally (docker-compose? Tilt? Skaffold?)
8. **Stage 1 milestones & sequencing** — which services to build first, MVP path

---

*End of Stage 1 high-level requirements.*
