# Day 7 — Checkout, Order Placement Saga, Razorpay

**Goal:** Full checkout flow live. Customers can place an order, pay via Razorpay, and receive confirmation email with PDF invoice. Saga compensations work.

**Depends on:** Day 3 (addresses), Day 6 (cart + inventory).

---

## Backend — order-service

### Prisma schema
- `orders` — id (UUID v7), userId, status (enum: `pending_payment | confirmed | processing | shipped | delivered | cancelled | failed`), itemsCount, subtotal (paise), shippingFee (paise), totalAmount (paise), currency (`INR`), addressSnapshot (jsonb — full address copied at order time), paymentMethod (`razorpay`), razorpayOrderId, idempotencyKey, createdAt, updatedAt, confirmedAt (nullable)
- `order_items` — id, orderId, sku, productId, variantId (nullable), name, image (jsonb — primary thumbnail), unitPrice (paise), qty
- `order_status_history` — id, orderId, fromStatus, toStatus, changedAt, changedBy (userId or "system"), reason (nullable)
- `outbox`, `processed_events`

### Shipping fee rule (Stage 1, fixed)
- If subtotal ≥ ₹500 (50000 paise) → free
- Else flat ₹50 (5000 paise)
- Hardcoded in order-service; centralized in one helper for easy future change

### Endpoints
| Method | Path | Notes |
|---|---|---|
| POST | /orders | Requires `Idempotency-Key`. Body: `{ addressId, paymentMethod: "razorpay" }`. Reads cart server-side, validates published+in-stock, calculates totals. Runs saga steps 1–4. Returns `{ orderId, razorpayOrderId, amount, currency }`. |
| GET | /orders | User's order history; cursor-paginated; reverse-chronological |
| GET | /orders/:id | Order detail (user owns or admin) |
| POST | /orders/:id/cancel | Customer cancel — only allowed in `pending_payment` (always) or `confirmed` (before `processing`). Emits `Order.Cancelled.v1`. |
| GET | /admin/orders | Admin list with filters: status, dateRange, query (email/orderId), customerId. Cursor-paginated. |
| PATCH | /admin/orders/:id/status | Admin transitions (Day 8) |
| POST | /admin/orders/:id/cancel | Admin cancel (any non-terminal state) |
| GET | /admin/orders/:id | Full detail including audit log |

### Saga flow (per `design/order-placement-saga.md`)
1. Validate idempotency key (24h Redis cache `idem:<key>:<userId>`)
2. Read cart + address; reject if cart empty or address not owned
3. Calculate subtotal + shipping + total
4. Reserve inventory via gRPC (timeout 800ms); fail → 409 INSUFFICIENT_STOCK
5. Create Razorpay order via payment-service REST (timeout 5s); fail → release reservation → 502
6. Persist order as `pending_payment` + `Order.Created.v1` to outbox (one tx)
7. Cache idempotency response
8. Return checkout payload

### Consumers
- `Payment.Captured.v1` → mark `confirmed`, emit `Order.Confirmed.v1`
- `Payment.Failed.v1` → mark `failed`, emit `Order.Failed.v1`

### Background workers
- TTL sweep every 5min: orders in `pending_payment` past inventory TTL → mark `failed`, emit `Order.Failed.v1`
- Razorpay reconciliation cron (nightly 03:00 IST) → fetch Razorpay payments for previous day, cross-check, alert on mismatches

### Cancellation rules (enforced server-side)
- `pending_payment` → cancelled by customer or admin → emits `Order.Cancelled.v1` (inventory releases)
- `confirmed` → cancelled by customer or admin → emits `Order.Cancelled.v1` (inventory restocks + refund flow triggered, deferred Stage 2)
- `processing` → only admin can cancel; same flow
- `shipped`, `delivered` → cancellation blocked (return flow is Stage 2)

---

## Backend — payment-service

### Prisma schema
- `payments` — id, orderId, razorpayOrderId, razorpayPaymentId (nullable), amount (paise), currency, method (string), status (`created | captured | failed`), capturedAt, failureReason, createdAt
- `processed_webhook_events` — razorpayEventId (PK), receivedAt, eventType
- `outbox`

### Endpoints
| Method | Path | Notes |
|---|---|---|
| POST | /payments | Internal-only (called by order-service via mTLS). Creates Razorpay order with receipt = our orderId. Returns `razorpayOrderId`. |
| POST | /webhooks/razorpay | Public; HMAC-SHA256 signature verification using webhook secret from Secrets Manager. Dedups by Razorpay `event.id`. Emits Kafka event. |
| GET | /payments/:id | For order-service + admin |
| GET | /admin/payments | Filterable list for admin |
| GET | /admin/payments/reconciliation/:date | Latest reconciliation report (admin) |

### Webhook events handled
| Razorpay event | Action |
|---|---|
| `payment.captured` | Update payment.status=captured; emit `Payment.Captured.v1` |
| `payment.failed` | Update payment.status=failed; emit `Payment.Failed.v1` |
| `order.paid` | Idempotent sanity log; no event emit (captured is canonical) |

### Reconciliation cron
- Nightly: fetch Razorpay `payments.all` for previous IST day
- Compare against `payments` table (by razorpayPaymentId)
- Generate report (counts, mismatches, missing-in-our-DB, missing-in-razorpay)
- Persist report; alert admin (notification + log) if mismatches > 0

---

## Backend — notification-service (extensions)

New templates:
| Template ID | Channel | Trigger event |
|---|---|---|
| `order-confirmed` | email | `Order.Confirmed.v1` — includes PDF invoice attachment |
| `order-confirmed` | sms | same — short message with order ID + total |
| `order-failed` | email | `Order.Failed.v1` |
| `order-failed` | sms | same |

### PDF invoice
- Generated on `Order.Confirmed.v1` consumption
- Library: `pdfkit`
- Content: order ID, date (IST), customer name, shipping address, items table (name, qty, price, line total), subtotal, shipping fee, total, payment method, "Storm" branding placeholder
- Attached to confirmation email
- Stored in S3 (`storm-invoices/<orderId>.pdf`) with 7-year retention; signed URL returned to customer on demand
- Endpoint: `GET /orders/:id/invoice` returns redirect to signed S3 URL (auth-required, user-owned check)

---

## Backend — web-bff (extensions)

| Method | Path | Notes |
|---|---|---|
| POST | /checkout/init | Validates current cart server-side, returns `{ items, subtotal, shippingFee, total, addresses (user's), defaultAddressId }`. Refuses if cart empty or any item out-of-stock (with which items). |
| POST | /orders | Forwards to order-service with idempotency key from header |
| GET | /orders | Forwards |
| GET | /orders/:id | Forwards |

---

## Frontend — `apps/web` (checkout flow)

### Pages / flow
- `/checkout` (auth-required; gated)
  - Step 1 — Address: list user's addresses with radio selection + "Add new address" inline (creates via `/me/addresses`). Required: phone number on selected address (must be verified mobile or address.mobile present)
  - Step 2 — Order review: items (read-only), subtotal, shipping fee, total. "Place Order" button.
  - Idempotency-Key generated client-side per checkout attempt (UUID v4 stored in sessionStorage; reused if user retries on the same screen)
- On "Place Order":
  - Calls `POST /orders` → receives `{ orderId, razorpayOrderId, amount }`
  - Opens Razorpay JS checkout (modal) with `{ key, razorpayOrderId, prefill: { name, email, contact } }`
  - On Razorpay success callback → redirects to `/checkout/success?orderId=`
  - On Razorpay dismiss → stays on review page; existing order stays `pending_payment` (will TTL-fail if user doesn't retry)
  - On Razorpay failure → redirects to `/checkout/failed?orderId=`
- `/checkout/success?orderId=` — polls `/orders/:id` for status; shows confirmation when `confirmed`. Until then, shows "Confirming your payment…"
- `/checkout/failed?orderId=` — explains failure, "Try again" button → re-opens Razorpay for the same order
- `/orders` — order history list
- `/orders/:id` — order detail with items, status badge, address, "Download invoice" button (only if `confirmed`), "Cancel order" button (only when cancellable per rules above)

### UX rules
- "Place Order" disabled when cart is invalid or address not selected
- Inline error display if BFF rejects (e.g., out-of-stock item) → links back to cart
- Loading spinners during the 1–5s "Place Order" round-trip
- Toast on successful order
- Mobile-first responsive

---

## Execution Order
1. payment-service Razorpay order create + webhook receiver + signature verify
2. order-service migrations + endpoints + saga
3. Idempotency cache + cancellation rules
4. order-service consumers + TTL sweep + reconciliation cron
5. notification-service order templates + PDF invoice generation
6. web-bff `/checkout/init` + order proxy
7. Customer app `/checkout` flow + Razorpay JS integration
8. `/checkout/success` and `/checkout/failed` pages
9. `/orders` history + `/orders/:id` detail
10. Download invoice flow

---

## Definition of Done

| Check |
|---|
| Add cart → checkout init → review → place order → Razorpay opens with correct amount |
| Successful test payment → webhook → order confirmed within seconds |
| Email arrives with PDF invoice attached; SMS confirmation arrives |
| Cart cleared post-confirmation |
| Failed payment → inventory released → user notified → order in `failed` state |
| Idempotency-Key retry returns same response (no duplicate order) |
| Razorpay webhook with bad signature rejected |
| Duplicate webhook (same event.id) processed once |
| TTL sweep cancels stale `pending_payment` |
| Customer can cancel `pending_payment` or `confirmed` (pre-processing) order |
| Customer cannot cancel `shipped` order (UI button hidden + server rejects) |
| Free shipping triggers for subtotal ≥ ₹500 |
| Reconciliation cron runs; report visible in admin |
| Download invoice returns the PDF |
| /checkout requires auth (anonymous redirected to login with returnTo) |

---

## Out of scope today
- Refunds (Stage 2)
- COD or other payment methods (Stage 2)
- Order status transitions beyond confirmed (Day 8)
- Partial fulfillment (Stage 2)
- Returns (Stage 2)
