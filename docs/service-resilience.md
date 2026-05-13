# Service Resilience

**Applies to:** Any service operating in a distributed environment where downstream dependencies will fail.

---

## 1. Goals

- Failures stay isolated — one slow dependency does not bring down the caller
- Recovery is automatic — no human in the loop for transient issues
- Degradation is graceful — partial functionality beats total outage

---

## 2. Core Principle — Plan for Failure

Every cross-service call **will eventually fail or slow down**. Resilience is built by assuming this from the start — not by trying to make the network perfect.

---

## 3. Timeouts

| Rule | Detail |
|---|---|
| Every network call has a timeout | No exceptions; library defaults (often minutes) are not acceptable |
| Timeouts are layered | Per-call < per-request < per-user-action |
| Sum of downstream timeouts < upstream timeout | Otherwise upstream times out first and the work is wasted |
| Default per-call timeout | 1–3 seconds for internal RPC; tune to 99th percentile latency |

---

## 4. Retries

| Rule | Detail |
|---|---|
| Retry only idempotent operations | GET, idempotent POST with idempotency key. Never retry an unsafe POST. |
| Exponential backoff with jitter | E.g., 100ms, 200ms, 400ms ± 30% random — prevents synchronized retry storms |
| Cap attempts | 2–3 retries is usually enough. More makes outages worse. |
| Respect `Retry-After` | When the downstream says wait, wait |

---

## 5. Circuit Breakers

For dependencies failing systematically rather than transiently.

| State | Behavior |
|---|---|
| Closed | Normal operation; track failures |
| Open | Skip the call; fail fast or return a fallback |
| Half-open | Try a single probe after cooldown; success closes the breaker, failure reopens it |

Retries against a failing dependency make the failure worse. The breaker stops the bleeding and gives the dependency room to recover.

---

## 6. Bulkheads

Isolate failures so they don't consume all resources.

| Technique | Detail |
|---|---|
| Separate thread pools / connection pools per dependency | A hung downstream can't starve calls to other downstreams |
| Separate Kubernetes deployments per criticality | Critical and best-effort workloads scale and fail independently |
| Per-tenant or per-customer quotas | One heavy user can't exhaust shared capacity |

---

## 7. Graceful Degradation

| Scenario | Response |
|---|---|
| Recommendation service down | Show generic top-sellers — never block the page |
| Search index down | Fall back to DB-backed search with reduced relevance |
| Cache cluster down | Hit origin directly with degraded latency, not an error |
| Optional enrichment fails | Return core response without the enrichment field |

Mandatory paths (auth, checkout) fail closed. Optional paths fail open with degraded experience.

---

## 8. Backpressure

| Rule | Detail |
|---|---|
| Bounded queues | All internal queues have a max size; reject or shed at the limit |
| Rate limit at the edge | Don't accept work you can't complete in time |
| Adaptive concurrency | Reduce in-flight requests when latency rises |

---

## 9. Health Checks

| Check | Purpose | Answers |
|---|---|---|
| Liveness | Is the process healthy? | "Should the orchestrator restart me?" |
| Readiness | Can I serve traffic? | "Should the load balancer send me requests?" |
| Startup | Have I finished booting? | "Wait before health-checking me normally" |

Readiness probes check **critical** dependencies only, not every dependency. Otherwise one downstream outage removes the service from the load balancer.

---

## 10. Conventions

| Concern | Convention |
|---|---|
| Timeouts | Mandatory on every network call; layered; sum < upstream |
| Retries | Idempotent calls only; exponential backoff + jitter; cap at 2–3 |
| Circuit breakers | On every cross-service dependency |
| Bulkheads | Per-dependency resource isolation |
| Degradation | Optional paths fail open; mandatory paths fail closed |
| Backpressure | Bounded queues, edge rate limits |
| Health checks | Liveness + readiness; readiness checks critical deps only |

---

## 11. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| No timeouts (library defaults) | One slow dependency hangs everything |
| Retries without backoff | Synchronized retry storms turn brownouts into outages |
| Retrying non-idempotent operations | Duplicate side effects |
| Unlimited retries | Makes the outage longer, not better |
| No circuit breaker | Cascading failures across the service graph |
| Readiness probe checks every dependency | One downstream blip removes the service from rotation |
| Unbounded queues | Memory exhaustion under sustained overload |
| Treating optional features as mandatory in the code path | One non-critical service takes down the whole feature |
