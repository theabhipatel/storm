# order-service

**Purpose:** Order lifecycle owner and saga orchestrator for checkout.

## Storage
- Postgres: orders, order_items, order_status_history, outbox, processed_events

## Owned Entities

| Entity | Key fields |
|---|---|
| Order | id, userId, status, totalAmount, currency, addressSnapshot, paymentMethod, razorpayOrderId, createdAt, updatedAt |
| OrderItem | id, orderId, sku, name, qty, unitPrice |
| OrderStatusHistory | orderId, status, changedAt, changedBy (user/system/admin) |
| Outbox | standard outbox |
| ProcessedEvent | eventId, processedAt (for consumer dedup) |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| POST | /orders | Place order (Idempotency-Key required) |
| GET | /orders/:id | Get order detail |
| GET | /orders | List current user's orders |
| POST | /orders/:id/cancel | Cancel (if cancellable) |
| PATCH | /admin/orders/:id/status | Admin updates status |
| GET | /admin/orders | Admin list with filters |

## Events Produced

| Event | When |
|---|---|
| Order.Created.v1 | After persisting `pending_payment` |
| Order.Confirmed.v1 | After payment captured |
| Order.Failed.v1 | After compensation |
| Order.StatusChanged.v1 | Admin updates status |
| Order.Cancelled.v1 | Cancellation |

## Events Consumed

| Event | Action |
|---|---|
| Payment.Captured.v1 | Mark order confirmed; trigger downstream |
| Payment.Failed.v1 | Run compensation (release inventory, mark failed) |

## Dependencies
- inventory-service (gRPC) for reservation
- payment-service (REST) for Razorpay order creation
- cart-service (read) for items at checkout

## Notes
- Full saga in [design/order-placement-saga.md](../order-placement-saga.md)
- Background sweep cancels stale `pending_payment` orders past inventory TTL
