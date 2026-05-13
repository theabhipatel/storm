# Event-Driven Architecture

**Applies to:** Asynchronous communication between services via a durable message broker (Kafka, NATS JetStream, AWS Kinesis, etc.).

---

## 1. Goals

- Loose coupling — producer doesn't know consumers
- Durability — events survive consumer downtime
- Replayability — late consumers can rebuild state from history
- Independent scaling of producers and consumers

---

## 2. Core Rules

| Rule | Detail |
|---|---|
| Events are facts, not commands | `OrderPlaced`, not `PlaceOrder`. Past tense. Describe what happened, not what to do. |
| One owner per event type | The service whose data changed publishes the event. Others consume. |
| Events are immutable | Never edit an event after publish; emit a corrective event if needed. |
| Schemas are explicit | Every event has a registered, versioned schema. No free-form payloads. |
| Delivery is at-least-once | Consumers must handle duplicates idempotently. Exactly-once is a myth at scale. |

---

## 3. Event Naming

| Rule | Example |
|---|---|
| `<Aggregate>.<EventName>` | `Order.Placed`, `Payment.Captured`, `Inventory.Reserved` |
| Past tense | `Placed`, not `Place` or `Placing` |
| Aggregate-scoped | The aggregate prefix is the producer's bounded context |
| Version in topic or schema | `Order.Placed.v1`; bump on breaking changes |

---

## 4. Event Schema — Required Fields

| Field | Purpose |
|---|---|
| `eventId` | Unique per event (UUID) — used by consumers for dedup |
| `eventType` | Fully-qualified name including version |
| `occurredAt` | ISO 8601 UTC timestamp of the business event |
| `producer` | Name of the producing service |
| `traceId` | Distributed trace ID propagated from the originating request |
| `data` | The event payload (schema-defined) |

Schemas use a registry (Avro/Protobuf with Confluent or AWS Glue Schema Registry) or a shared, version-controlled contracts package.

---

## 5. Schema Evolution

| Change | Rule |
|---|---|
| Add optional field with default | Backward-compatible; allowed |
| Add required field | Breaking; new schema version |
| Remove a field | Breaking; new schema version |
| Change a field type | Breaking; new schema version |
| Rename a field | Breaking; new schema version |
| Coexisting versions | Maximum two; consumers migrate within an explicit window |

---

## 6. Producer Responsibilities

| Responsibility | Detail |
|---|---|
| Atomic write + publish | Use the transactional outbox pattern (see [data-consistency.md](./data-consistency.md)) — never publish first and write later, or vice versa |
| Schema conformance | Validate against the registered schema before sending |
| One topic per event type | Don't multiplex unrelated event types onto one topic |

---

## 7. Consumer Responsibilities

| Responsibility | Detail |
|---|---|
| Idempotency | Treat duplicates as expected; dedupe by `eventId` or business key |
| Offset management | Commit only after successful processing |
| Backpressure | Slow consumers must lag, not drop. Scale partitions and consumer instances |
| Replay-safe | Reprocessing the entire history must converge to the correct state |

---

## 8. Ordering & Partitioning

| Rule | Detail |
|---|---|
| Order is per-partition only | Across partitions, no order guarantee |
| Partition by aggregate ID | All events for the same order go to the same partition |
| Choose partition count for peak parallelism | Cannot be reduced later in Kafka |

---

## 9. Failure Handling

| Situation | Strategy |
|---|---|
| Transient downstream failure | Retry with exponential backoff inside the consumer |
| Persistent failure | Send to dead-letter topic with original headers + failure reason |
| Poison pill (un-parseable event) | Skip and DLQ; alert on DLQ growth |
| Re-processing | Restart consumer from earlier offset; idempotency ensures correctness |

---

## 10. Conventions

| Concern | Convention |
|---|---|
| Naming | `<Aggregate>.<EventName>.v<N>`, past tense |
| Required fields | `eventId`, `eventType`, `occurredAt`, `producer`, `traceId`, `data` |
| Schema source | Registry or shared contracts package |
| Delivery semantics | At-least-once |
| Producer atomicity | Transactional outbox |
| Consumer dedup | By `eventId` or business key |
| Partition key | Aggregate ID |
| Failure handling | Backoff retries → DLQ |

---

## 11. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Command events (`PlaceOrder`) | Couples producer to consumer behavior — defeats event-driven decoupling |
| Multiple producers writing the same event type | No clear owner; schema drift; conflicting facts |
| Editing events after publish | Consumers may have already acted on the old value |
| Free-form / schema-less events | Silent breakage; consumers crash on unexpected shapes |
| Publishing without writing to own DB first | Lost events on producer crash |
| Writing to own DB then publishing (no outbox) | Lost events if process dies between |
| Consumers not idempotent | Duplicate side effects under at-least-once delivery |
| Relying on exactly-once delivery | Doesn't exist at scale; design for at-least-once + idempotency |
| Cross-partition ordering assumptions | Will break under load |
