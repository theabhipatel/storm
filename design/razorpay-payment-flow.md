# Razorpay Payment Flow

**Scope:** End-to-end payment integration. Single Razorpay integration covers UPI Collect/Intent/QR, debit/credit cards, net banking, wallets.

---

## 1. Roles

| Actor | Role |
|---|---|
| Client (Next.js) | Opens Razorpay Checkout |
| order-service | Initiates payment via payment-service |
| payment-service | Creates Razorpay order; receives webhooks; emits events |
| Razorpay | Payment gateway |

---

## 2. Order Creation (Synchronous)

| Step | Actor | Action |
|---|---|---|
| 1 | order-service → payment-service (REST) | Create payment for `orderId`, amount, currency, customer |
| 2 | payment-service → Razorpay API | `POST /v1/orders` with idempotent receipt = `orderId` |
| 3 | Razorpay → payment-service | Returns `razorpayOrderId` |
| 4 | payment-service | Persists `Payment` row, status `created` |
| 5 | payment-service → order-service | Returns `razorpayOrderId` |
| 6 | order-service → client | Returns checkout payload `{ orderId, razorpayOrderId, amount, key }` |

---

## 3. Checkout (Client-Side)

| Step | Detail |
|---|---|
| 1 | Client loads Razorpay JS SDK |
| 2 | Opens checkout with `{ key, razorpayOrderId, prefill, theme }` |
| 3 | User picks method (UPI / card / netbanking / wallet); completes payment in Razorpay UI |
| 4 | Razorpay closes; client gets `razorpayPaymentId`, `razorpayOrderId`, `razorpaySignature` on success |
| 5 | Client navigates to `/orders/:id` — does **not** trust client-side result; relies on webhook |

---

## 4. Webhook (Authoritative Source)

| Step | Actor | Action |
|---|---|---|
| 1 | Razorpay → payment-service | `POST /webhooks/razorpay` with `X-Razorpay-Signature` header |
| 2 | payment-service | Verifies signature: HMAC-SHA256(body, webhook_secret) == header |
| 3 | payment-service | Looks up `event.id` in `processed_webhook_events`; if found, return 200 (idempotent) |
| 4 | payment-service | Stores `event.id`; updates `Payment.status` based on event type |
| 5 | payment-service | Emits Kafka event: `Payment.Captured.v1` or `Payment.Failed.v1` (via outbox) |
| 6 | order-service consumer | Updates order state per saga |

**Webhook events handled:**

| Razorpay event | Our action |
|---|---|
| `payment.captured` | Emit `Payment.Captured.v1` |
| `payment.failed` | Emit `Payment.Failed.v1` |
| `order.paid` | Sanity check; secondary to `payment.captured` |
| `refund.processed` (Stage 2) | Emit `Payment.Refunded.v1` |

---

## 5. Security

| Concern | Mechanism |
|---|---|
| Webhook authenticity | HMAC-SHA256 signature verification with webhook secret from AWS Secrets Manager |
| Webhook idempotency | Dedup by Razorpay `event.id` in `processed_webhook_events` table |
| Webhook source | Razorpay's webhook IPs allowlisted at WAF (defense in depth) |
| Endpoint path | Public but unguessable; no auth header (Razorpay can't carry one) — signature is the auth |
| PCI scope | None — card data never touches our servers; Razorpay handles |

---

## 6. Reconciliation

| Job | Cadence | Action |
|---|---|---|
| Nightly reconciliation | 03:00 IST | Fetch Razorpay's payments for previous day; cross-check against our `payments` table; alert on mismatches |
| Pending order sweep | Every 5 min | Find `pending_payment` orders past inventory TTL; query Razorpay for their `razorpayOrderId`; act accordingly (confirm if paid, fail otherwise) |

---

## 7. Failure Scenarios

| Scenario | Handling |
|---|---|
| Webhook arrives twice | Dedup by `event.id` → idempotent |
| Webhook never arrives | Reconciliation sweep catches it within 5 min |
| Razorpay API down during order creation | order-service compensates (release inventory) and returns 502 to client |
| Signature verification fails | Return 400, log, alert if persistent (possible attack) |
| `Payment.Captured` emitted but order-service crashed | Kafka redelivers; order-service consumer is idempotent on `eventId` |
| Payment captured after inventory TTL expired | Saga compensates: trigger Razorpay refund + notify user |

---

## 8. Stage 2 Considerations

- Refunds (full + partial)
- Saved payment methods (Razorpay tokenization)
- Subscriptions / recurring (not applicable to physical goods)
- International payments
