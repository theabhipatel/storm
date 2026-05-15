# Order Placement Saga

**Goal:** Place an order safely across cart, inventory, payment, order, and notification services, with deterministic rollback on any failure.

**Style:** **Orchestration** — `order-service` is the orchestrator. Chosen over choreography because payment failure compensation is too critical to scatter across services.

---

## 1. Services Involved

| Service | Role |
|---|---|
| `web-bff` | Receives client request, forwards to `order-service` |
| `order-service` | Saga orchestrator; owns order lifecycle |
| `inventory-service` | Reserves stock with TTL |
| `payment-service` | Talks to Razorpay; verifies webhooks |
| `notification-service` | Sends email + SMS post-confirmation |
| `cart-service` | Source of items; cleared after order confirmed |

---

## 2. Happy Path

| Step | Actor | Action |
|---|---|---|
| 1 | Client → web-bff → order-service | `POST /orders` with `Idempotency-Key`; body: cart snapshot + address + payment method |
| 2 | order-service → inventory-service (gRPC) | `Reserve(items, ttl=15m)` → returns `reservationId` |
| 3 | order-service → payment-service (REST) | Create Razorpay order; returns `razorpayOrderId` |
| 4 | order-service (one DB tx) | Insert order as `pending_payment` **and** `Order.Created` row in outbox |
| 5 | order-service → client | Return `{ orderId, razorpayOrderId, amount }` |
| 6 | Client | Opens Razorpay checkout; user pays |
| 7 | Razorpay → payment-service | Webhook `payment.captured`; verify signature; dedupe by `event.id`; emit `Payment.Captured` (Kafka) |
| 8 | order-service (consumer) | Mark order `confirmed`; emit `Order.Confirmed` via outbox |
| 9 | notification-service (consumer) | Send order confirmation email + SMS |
| 10 | cart-service (consumer) | Clear the user's cart |

---

## 3. Order State Machine

```
pending_payment ──Payment.Captured──→ confirmed ──admin──→ processing ──→ shipped ──→ delivered
        │
        └──Payment.Failed / TTL expiry──→ failed (compensated)

confirmed ──admin cancel──→ cancelled
```

---

## 4. Compensations (Failure Paths)

| Failure point | Compensation |
|---|---|
| Inventory reservation fails (out of stock) | Return 409 to client; no state created |
| Razorpay order creation fails | Release inventory reservation; return 502 |
| Persist order fails (DB error) | Release inventory reservation; return 500 |
| `Payment.Failed` event consumed | Release inventory reservation; mark order `failed`; emit `Order.Failed` → notification-service notifies user |
| Payment never received (TTL expiry) | Background sweep finds `pending_payment` orders older than TTL; release reservation; mark `failed` |
| Razorpay webhook never arrives | Fallback poll: order-service polls payment-service every N minutes for ambiguous orders |

---

## 5. Idempotency

| Place | Mechanism |
|---|---|
| Order creation | `Idempotency-Key` header → order-service stores `(key, userId) → response` in Redis 24h |
| Razorpay webhook | payment-service dedupes by `event.id` in a `processed_events` table |
| Event consumers | Each consumer dedupes by `eventId` in its own `processed_events` table |
| Inventory reservation | gRPC includes idempotency token derived from `(orderId, attemptNumber)` |

---

## 6. Timeouts

| Call | Timeout |
|---|---|
| order-service → inventory-service (gRPC) | 500 ms |
| order-service → payment-service (REST → Razorpay) | 3 s |
| order-service local DB tx | 2 s |
| End-to-end `POST /orders` | 5 s |
| Inventory reservation TTL | 15 min |

---

## 7. Events Emitted

| Event | Producer | Consumers |
|---|---|---|
| `Order.Created.v1` | order-service | analytics (later stages) |
| `Order.Confirmed.v1` | order-service | notification-service, cart-service, recommendation-service |
| `Order.Failed.v1` | order-service | notification-service |
| `Payment.Captured.v1` | payment-service | order-service |
| `Payment.Failed.v1` | payment-service | order-service |
| `Inventory.Reserved.v1` | inventory-service | internal audit |
| `Inventory.Released.v1` | inventory-service | internal audit |

All events follow the schema in [event-driven-architecture.md](../docs/event-driven-architecture.md).

---

## 8. Concurrency & Race Conditions

| Scenario | Handling |
|---|---|
| Two users buying the last item | Inventory reservation uses optimistic locking on stock count; loser gets "insufficient stock" |
| User retries place-order during in-flight request | Idempotency key returns cached response |
| Webhook arrives before order row exists | order-service consumer retries with backoff until order found; DLQ after max attempts |
| User pays after TTL expiry | payment-service captures regardless; order-service compensates with Razorpay refund + user notification |

---

## 9. Why Orchestration Over Choreography

- Single source of truth for "where is this order"
- Compensation logic centralized and testable
- Audit trail per order in one place
- 5-service choreography with compensations = unreasonable complexity

---

## 10. Open Decisions (Deferred to Stage 2)

- Refund flow (Stage 1 has no refunds)
- Partial fulfillment (Stage 1 is all-or-nothing)
- Coupon / discount application
- Multi-address split shipments
