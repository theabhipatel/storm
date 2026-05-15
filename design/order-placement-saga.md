# Order Placement Saga

**Goal:** Place an order safely across cart, inventory, payment, order, and notification services, with deterministic rollback on any failure.

**Style:** **Choreography** for the compensation phase — services react to domain events, each responsible for its own state. Pre-payment validation is synchronous (unavoidable: client needs a Razorpay order ID and confirmed stock to proceed). Aligns with the default in [docs/data-consistency.md](../docs/data-consistency.md).

---

## 1. Services Involved

| Service | Role |
|---|---|
| `web-bff` | Receives client request, forwards to `order-service` |
| `order-service` | Owns order state; emits domain events; reacts to `Payment.*` |
| `inventory-service` | Owns stock and reservations; reacts to `Order.Confirmed` / `Order.Failed` |
| `payment-service` | Talks to Razorpay; emits `Payment.*` events |
| `notification-service` | Reacts to `Order.*` events |
| `cart-service` | Reacts to `Order.Confirmed` to clear cart |

---

## 2. Happy Path

| Step | Actor | Action |
|---|---|---|
| 1 | Client → web-bff → order-service | `POST /orders` with `Idempotency-Key`; body: cart snapshot + address + payment method |
| 2 | order-service → inventory-service (gRPC, sync) | `Reserve(items, ttl=15m)` → returns `reservationId` |
| 3 | order-service → payment-service (REST, sync) | Create Razorpay order; returns `razorpayOrderId` |
| 4 | order-service (one DB tx) | Insert order as `pending_payment` **and** `Order.Created.v1` row in outbox |
| 5 | order-service → client | Return `{ orderId, razorpayOrderId, amount }` |
| 6 | Client | Opens Razorpay checkout; user pays |
| 7 | Razorpay → payment-service | Webhook `payment.captured`; verify signature; dedupe by `event.id`; emit `Payment.Captured.v1` via outbox |
| 8 | order-service (consumer) | Mark order `confirmed`; emit `Order.Confirmed.v1` via outbox |
| 9 | inventory-service (consumer) | Confirm reservation → permanent decrement |
| 10 | notification-service (consumer) | Send order confirmation email + SMS |
| 11 | cart-service (consumer) | Clear the user's cart |

---

## 3. Order State Machine

```
pending_payment ──Payment.Captured──→ confirmed ──admin──→ processing ──→ shipped ──→ delivered
        │
        └──Payment.Failed / TTL expiry──→ failed (compensated via Order.Failed event)

confirmed ──admin cancel──→ cancelled (compensated via Order.Cancelled event)
```

---

## 4. Compensations (Event-Driven)

The principle: each service owns its compensation, triggered by domain events.

| Trigger | order-service action | Resulting events | Reactions |
|---|---|---|---|
| Inventory reservation fails at step 2 | Return 409 to client | none | none — nothing persisted |
| Razorpay create fails at step 3 | Release reservation (direct gRPC — no order persisted yet) + return 502 | none | none |
| order-service DB tx fails at step 4 | Release reservation (direct gRPC) + return 500 | none | none |
| `Payment.Failed.v1` consumed | Mark order `failed`; emit `Order.Failed.v1` | `Order.Failed.v1` | inventory releases reservation; notification informs user |
| Payment TTL expiry (background sweep) | Mark order `failed`; emit `Order.Failed.v1` | `Order.Failed.v1` | Same as above |
| Razorpay webhook never arrives | Fallback poll every 5 min queries payment-service for ambiguous orders | (either path above) | Same as above |
| Admin cancels confirmed order | Mark `cancelled`; emit `Order.Cancelled.v1` | `Order.Cancelled.v1` | inventory restocks; notification informs user |

**Rule:** Once an order row exists, compensation flows through events. Before persistence, direct compensation is acceptable (nothing to consume).

---

## 5. Idempotency

| Place | Mechanism |
|---|---|
| Order creation | `Idempotency-Key` header → order-service stores `(key, userId) → response` in Redis 24h |
| Razorpay webhook | payment-service dedupes by Razorpay `event.id` in `processed_webhook_events` |
| Event consumers | Each consumer dedupes by `eventId` in its own `processed_events` table |
| Inventory reservation | gRPC includes idempotency token derived from `(orderId, attemptNumber)` |

---

## 6. Timeouts

| Call | Timeout |
|---|---|
| order-service → inventory-service (gRPC) | 800 ms |
| order-service → payment-service (REST → Razorpay) | 5 s |
| order-service local DB tx | 2 s |
| End-to-end `POST /orders` | 8 s |
| Inventory reservation TTL | 15 min |

---

## 7. Events Emitted

| Event | Producer | Consumers |
|---|---|---|
| `Order.Created.v1` | order-service | (analytics, deferred) |
| `Order.Confirmed.v1` | order-service | inventory-service, notification-service, cart-service, recommendation-service |
| `Order.Failed.v1` | order-service | inventory-service, notification-service |
| `Order.Cancelled.v1` | order-service | inventory-service, notification-service |
| `Order.StatusChanged.v1` | order-service | notification-service |
| `Payment.Captured.v1` | payment-service | order-service |
| `Payment.Failed.v1` | payment-service | order-service |
| `Inventory.Reserved.v1` | inventory-service | (internal audit) |
| `Inventory.Released.v1` | inventory-service | (internal audit) |

All events follow the envelope in [docs/event-driven-architecture.md](../docs/event-driven-architecture.md).

---

## 8. Concurrency & Race Conditions

| Scenario | Handling |
|---|---|
| Two users buying the last item | Inventory uses optimistic locking on stock count; loser gets "insufficient stock" |
| User retries place-order during in-flight request | Idempotency key returns cached response |
| Webhook arrives before order row exists | order-service consumer retries with backoff until order found; DLQ after max attempts |
| User pays after TTL expiry | payment-service captures regardless; order-service marks `failed` and emits `Order.Failed`; downstream refund flow (Stage 2) triggered |

---

## 9. Why Choreography (Compensation Phase)

- Matches the playbook default — no central orchestrator for post-payment state
- inventory, notification, cart each own their compensation logic
- Lower coupling: adding a new consumer (analytics, fraud check) requires no change to order-service
- Order state still has a single owner (order-service), which keeps audit clean

---

## 10. Open Decisions (Deferred to Stage 2)

- Refund flow for post-TTL captures and admin cancellations
- Partial fulfillment (Stage 1 is all-or-nothing)
- Coupon / discount application
- Multi-address split shipments
