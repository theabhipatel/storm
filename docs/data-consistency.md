# Data Consistency Patterns

**Applies to:** Any distributed system where data is partitioned across services that each own their own datastore.

---

## 1. Goals

- Business correctness despite distribution
- Acceptable trade-offs between consistency, availability, and latency
- Automatic recovery from partial failures

---

## 2. Core Principle — Embrace Eventual Consistency

Across services, data is **eventually consistent by default**. Trying to enforce strong consistency across services destroys microservices benefits.

| Within a service | Across services |
|---|---|
| Strong consistency via local DB transactions | Eventual consistency via events |
| ACID guarantees | Compensating actions for failures |

---

## 3. Transactional Outbox

The standard pattern for atomically updating local state **and** publishing an event.

| Step | Action |
|---|---|
| 1 | Within one local DB transaction, write the business change to the domain table **and** an event row to an `outbox` table |
| 2 | A separate relay process polls the `outbox` and publishes events to the broker |
| 3 | On successful publish, mark the row sent (or delete it) |
| 4 | Crashes between steps are safe: the relay retries unsent rows on restart |

Without this, you have a dual-write problem — you write to the DB then fail to publish, or publish then fail to write. The outbox makes the DB the single source of truth.

---

## 4. Saga Pattern

For workflows that span multiple services and cannot be wrapped in a distributed transaction.

| Style | Use when |
|---|---|
| Choreography | Few steps; services react to each other's events. No central coordinator. |
| Orchestration | Many steps, complex branching. A dedicated orchestrator service drives the flow. |

Each step has a **compensating action** that undoes its effect if a later step fails. The saga as a whole is eventually consistent — never atomic.

Example sequence:

| Step | Forward action | Compensation |
|---|---|---|
| 1 | Reserve inventory | Release reservation |
| 2 | Charge payment | Refund payment |
| 3 | Create order | Cancel order |

If step 3 fails, run compensations 2 and 1 in reverse.

---

## 5. Idempotency

| Where | How |
|---|---|
| External API mutations | `Idempotency-Key` header → server stores result keyed by `(key, user)` for 24h |
| Event consumers | Dedupe by `eventId` or business key in a processed-events table |
| Retries within a service | Operations designed so applying twice == applying once |

**Required on:** payments, orders, anything that costs money or sends notifications. **Recommended on:** all mutations.

---

## 6. Optimistic Locking

For concurrent updates without blocking.

| Rule | Detail |
|---|---|
| Version column | Every mutable row has a `version` integer |
| Update condition | `UPDATE … SET … , version = version + 1 WHERE id = ? AND version = ?` |
| Conflict handling | Zero rows affected → reject with 409 Conflict; client refetches and retries |

Use for cart updates, profile edits, anything user-driven.

---

## 7. Pessimistic Locking

| Rule | Detail |
|---|---|
| Use when | Genuine high contention on a single row (e.g., inventory under flash sale) |
| Mechanism | DB row locks (`SELECT … FOR UPDATE`) within a short transaction |
| Caution | Holding locks across network calls is a deadlock factory — never do it |

---

## 8. Distributed Transactions (Avoid)

Two-phase commit and XA transactions:

| Concern | Why to avoid |
|---|---|
| Performance | Blocks all participants until coordinator commits |
| Availability | Coordinator failure blocks the system |
| Operational complexity | Adds a critical, hard-to-debug component |
| Modern alternative | Saga + outbox + idempotency achieves the same business outcome without these costs |

---

## 9. Conventions

| Concern | Convention |
|---|---|
| Across services | Eventual consistency via events |
| Atomic local change + event | Transactional outbox |
| Multi-service workflow | Saga (choreography by default; orchestration when complex) |
| Concurrent writes | Optimistic locking with version column |
| Mutation idempotency | Idempotency keys + server-side dedup |
| Consumer idempotency | Dedupe by `eventId` |
| Distributed transactions | Avoid |

---

## 10. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Dual writes (DB then broker, or broker then DB) without outbox | Eventually loses events on crash |
| Two-phase commit across services | Tight coupling, blocking, no availability story |
| "Synchronous saga" (chain of HTTP calls) | All-or-nothing semantics without compensation = data inconsistency on partial failure |
| Pessimistic locks held across network calls | Deadlocks under load |
| No idempotency on payment/order endpoints | Network retries duplicate charges |
| Trusting "exactly-once" delivery | It's a marketing term; design for at-least-once |
| Strong consistency requirements crossing service boundaries | Indicates wrong service boundary |
