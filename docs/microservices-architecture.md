# Microservices Architecture Principles

**Applies to:** Any system built as a collection of independently deployable services.

---

## 1. Goals

- Independent deployability — one service can ship without coordinating with others
- Independent scalability — each service scales according to its own load
- Fault isolation — one service's failure does not cascade
- Team autonomy — each service can be owned, evolved, and operated by one team

---

## 2. Service Boundary Principles

| Rule | Detail |
|---|---|
| Bounded context | Each service owns one cohesive business capability (orders, payments, inventory). Boundaries follow business meaning, not technical layers. |
| One team, one service | A service has a single owning team. Multiple teams editing one service is the strongest signal the boundary is wrong. |
| No shared business logic | Services do not share business code via libraries. Shared code creates implicit coupling. |
| Independently deployable | Releasing service A must never require releasing service B. |

---

## 3. Data Ownership

| Rule | Detail |
|---|---|
| Each service owns its database | No other service reads from or writes to it directly. |
| Datastore choice is private | A service may switch databases without coordinating with others. |
| Data is exposed only via APIs and events | Other services consume; they don't query. |
| Cross-service joins forbidden in the data layer | Aggregate in the application layer (BFF) or via materialized views fed by events. |

Sharing a database between services is the single most common microservices anti-pattern. It eliminates every benefit of microservices while keeping all the operational cost.

---

## 4. Communication

Three patterns, used in order of preference:

| Pattern | Use case |
|---|---|
| Events (async) | Default for cross-service workflows. Producer publishes a fact; consumers react independently. |
| REST (sync) | Read paths, simple CRUD, BFF aggregation. |
| gRPC (sync) | Internal hot paths where latency matters (single-digit ms). |

Detail in [inter-service-communication.md](./inter-service-communication.md).

---

## 5. Contracts

| Rule | Detail |
|---|---|
| Every service publishes an explicit contract | API: OpenAPI. Events: schema (Avro/Protobuf/JSON Schema). gRPC: `.proto`. |
| Contracts are versioned | Breaking changes require a new major version coexisting with the old. |
| Backward compatibility within a major version | Add fields, don't rename or remove. |
| Contracts are linted in CI | Convention drift caught automatically. |

---

## 6. Repository Strategy

| Option | Use when |
|---|---|
| Monorepo with workspace tooling (default) | Single org, fewer than ~15 service teams, want shared tooling and atomic refactors |
| Polyrepo | Many independent teams, strict release independence, regulatory isolation |

Decoupling is enforced at runtime (own DB, own pipeline, own deploy), not at the repo boundary. Monorepo with strict path-filtered CI gives both decoupling and velocity at small-to-medium scale.

---

## 7. When Not to Use Microservices

| Signal | Reason |
|---|---|
| Single small team | Operational overhead exceeds agility benefit |
| No clear bounded contexts yet | Premature decomposition produces a distributed monolith |
| No platform investment | Microservices require observability, deployment, and service-discovery investment to function |

Start with a well-modularized monolith if any of these apply; extract services as boundaries become clear.

---

## 8. Conventions

| Concern | Convention |
|---|---|
| Service ownership | Exactly one team |
| Data ownership | Each service owns its database |
| Cross-service data access | API or event only — never direct DB |
| Shared code | Only contracts, logger, config — no business logic |
| Service-to-service auth | mTLS or signed service tokens |
| Inter-service contracts | OpenAPI / Proto / event schemas, versioned and linted |
| Deploy independence | One service can ship without coordinating with others |
| Repository | Monorepo by default until team size demands split |

---

## 9. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Shared database across services | Eliminates independent deployability and scaling |
| Service-to-service DB queries | Tight coupling masquerading as decoupling |
| Shared business-logic libraries | Implicit coupling — one team's change forces others to redeploy |
| Distributed monolith (services that must release together) | Distribution cost without distribution benefit |
| One team owning many services | Stretches focus; services rot |
| One service owned by many teams | Boundary is wrong; redraw it |
| Synchronous call chains > 2 hops deep | Latency multiplies, failures cascade — use events |
| Premature decomposition | Boundaries are guesses without business clarity; refactor cost is enormous |
