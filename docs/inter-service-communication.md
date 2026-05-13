# Inter-Service Communication

**Applies to:** Any distributed system where services exchange data and trigger work in each other.

---

## 1. Goals

- Right pattern for the right need — no one-size-fits-all
- Loose coupling where business flow allows
- Predictable latency and failure modes
- Contracts that evolve without breaking consumers

---

## 2. The Three Patterns

| Pattern | Strength | Cost | Use when |
|---|---|---|---|
| Events (async) | Loose coupling, replayable, scales independently | Eventual consistency | Cross-service workflows where the producer doesn't need an immediate response |
| REST (sync) | Simple, ubiquitous, debuggable | Tight runtime coupling, latency adds up | BFF aggregation, simple reads, external-facing APIs |
| gRPC (sync) | Low latency, strongly typed | Operational complexity, less debuggable | Internal hot paths with single-digit ms latency budget |

**Decision rule:** if the caller can proceed without knowing the result, use events. Otherwise sync — REST by default, gRPC only when latency demands it.

---

## 3. REST

| Concern | Recommended |
|---|---|
| Format | JSON over HTTP/1.1 or HTTP/2 |
| Contract | OpenAPI 3.x spec checked into the service repo |
| Style | See [api-conventions.md](./api-conventions.md) |
| Auth | Service-to-service signed tokens or mTLS (never raw user JWT pass-through) |
| Timeout | Always set, layered (per-call < per-request < per-user-action) |
| Retries | Idempotent calls only; backoff + jitter; cap attempts |

---

## 4. gRPC

| Concern | Recommended |
|---|---|
| Contract | Protocol Buffers (`.proto`) checked into the service repo; consumers generate clients |
| Streaming | Bidirectional/server streaming only when the data shape genuinely demands it |
| Auth | mTLS between services in the mesh |
| Reserved for | Hot paths — inventory reservations, real-time pricing, anything sub-10ms |
| Avoid for | External-facing APIs, BFF aggregation, anything an SRE will debug from a browser |

---

## 5. Events

Detail in [event-driven-architecture.md](./event-driven-architecture.md). Summary rules:

| Rule | Detail |
|---|---|
| Fact, not command | Events describe what happened, never what should happen next |
| One producer per event type | Anyone may consume; only one service publishes a given event |
| Schema-registered | Every event has an explicit, versioned schema |
| At-least-once delivery | Consumers must be idempotent |

---

## 6. Service-to-Service Authentication

| Approach | When |
|---|---|
| mTLS via service mesh (Linkerd, Istio) | Default at scale — automatic certificate rotation, transparent to application code |
| Signed service tokens (JWT, short TTL, issued by an internal authority) | When a mesh is not yet deployed |

User identity is passed as a separate claim/header alongside service identity — never conflated.

---

## 7. Contract Evolution

| Change | Rule |
|---|---|
| Add optional field | Allowed within a major version |
| Add required field | Breaking — new version |
| Rename or remove field | Breaking — new version |
| Change field type | Breaking — new version |
| Add new endpoint or event type | Allowed |
| Two major versions coexisting | Maximum; never three |

Consumers test against the producer's contract via consumer-driven contract tests (see [testing-strategy.md](./testing-strategy.md)).

---

## 8. Conventions

| Concern | Convention |
|---|---|
| Default pattern | Events (async) when business flow permits |
| Synchronous default | REST |
| Hot-path synchronous | gRPC |
| Auth | mTLS via mesh (preferred), signed tokens (alternative) |
| Timeouts | Mandatory on every call |
| Retries | Idempotent calls only, with backoff + jitter |
| Contracts | OpenAPI / Proto / event schemas, in-repo, linted in CI |
| Versioning | Major versions only; two-version coexistence max |

---

## 9. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Synchronous chains > 2 hops | Latency multiplies, failure surface explodes |
| Synchronous calls for workflows the caller doesn't need to wait for | Wastes user time; couples availability |
| Passing user JWT directly between internal services | Inflates blast radius of a compromise; user auth ≠ service auth |
| Retrying non-idempotent calls | Duplicate side effects (charges, orders) |
| Missing timeouts | One slow downstream cascades into hung threads everywhere |
| Bypassing contracts ("the team agreed verbally") | Drift, silent breakage, untestable |
| Using gRPC for everything because it's "faster" | Operational overhead without latency benefit on warm paths |
