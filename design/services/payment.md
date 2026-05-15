# payment-service

**Purpose:** Razorpay integration. Creates Razorpay orders for checkout, verifies webhooks, emits payment events.

## Storage
- Postgres: payments, processed_webhook_events, outbox

## Owned Entities

| Entity | Key fields |
|---|---|
| Payment | id, orderId, razorpayOrderId, razorpayPaymentId, amount, currency, method, status, capturedAt, failureReason |
| ProcessedWebhookEvent | razorpayEventId, receivedAt (dedup) |
| Outbox | standard outbox |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| POST | /payments | Internal: create Razorpay order (called by order-service) |
| GET | /payments/:id | Get payment record |
| POST | /webhooks/razorpay | Razorpay webhook receiver |
| GET | /admin/payments | Admin list |

## Events Produced

| Event | When |
|---|---|
| Payment.Captured.v1 | Webhook `payment.captured` verified |
| Payment.Failed.v1 | Webhook `payment.failed` verified, or order expired |

## Events Consumed

| Event | Action |
|---|---|
| Order.Cancelled.v1 | If payment was captured, initiate Razorpay refund (Stage 2 refund flow) |
| Order.Failed.v1 (post-TTL capture) | Same — initiate refund for orders failed after capture |

## Dependencies
- Razorpay API + webhooks

## Notes
- Webhook signature verified with HMAC-SHA256 using webhook secret
- Idempotent on Razorpay `event.id`
- See [design/razorpay-payment-flow.md](../razorpay-payment-flow.md) for the full flow
- Reconciliation: nightly job compares our payments table to Razorpay's payment list
