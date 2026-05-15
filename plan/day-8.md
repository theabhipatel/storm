# Day 8 — Order Lifecycle, Customer & Admin Order Management

**Goal:** Full order state machine works end-to-end. Admin transitions order status; customer sees real-time updates and receives notifications.

**Depends on:** Day 7 (orders + payments).

---

## Backend — order-service (extensions)

### State machine transitions (admin-driven via admin-bff)
Allowed transitions:
- `confirmed → processing`
- `processing → shipped`
- `shipped → delivered`
- Any state (`confirmed`, `processing`, `shipped`) → `cancelled` (admin only; emits `Order.Cancelled.v1`)
- Customer-cancellable: `pending_payment` (always) or `confirmed` (before `processing`)

### Endpoints (admin)
| Method | Path | Notes |
|---|---|---|
| PATCH | /admin/orders/:id/status | Body: `{ toStatus, note? }`. Validates allowed transition. Records `order_status_history`. Emits `Order.StatusChanged.v1`. Audit-logged with adminId. |
| POST | /admin/orders/:id/cancel | Body: `{ reason }`. Always allowed for non-terminal. Emits `Order.Cancelled.v1`. |

### Bulk operations
- None in Stage 1. Each status change individual.

### Events emitted
- `Order.StatusChanged.v1` — payload: `{ orderId, userId, fromStatus, toStatus, changedAt, changedBy }`
- `Order.Cancelled.v1` — payload: `{ orderId, userId, cancelledBy: "customer"|"admin", reason, cancelledAt }`

### Audit log
- Every admin action stored in `order_status_history` with `changedBy` = admin user ID and optional `reason`
- Visible in admin detail view

---

## Backend — notification-service (extensions)

New templates:
| Template ID | Channel | Trigger event | Content summary |
|---|---|---|---|
| `order-status-processing` | email + sms | `Order.StatusChanged.v1` toStatus=processing | "Your order is being prepared" |
| `order-status-shipped` | email + sms | toStatus=shipped | "Your order is on the way" |
| `order-status-delivered` | email + sms | toStatus=delivered | "Delivered. Thanks for shopping" |
| `order-cancelled-by-customer` | email + sms | `Order.Cancelled.v1` cancelledBy=customer | confirmation of cancellation |
| `order-cancelled-by-admin` | email + sms | cancelledBy=admin | apology + reason if provided |

### Dispatch rules
- Skip if `toStatus` doesn't have a template (no event lost; just no message)
- Idempotency by `eventId`

---

## Backend — admin-bff

### Composite endpoints
| Method | Path | Aggregates |
|---|---|---|
| GET | /admin/orders | order-service list + denormalized customer email + total count |
| GET | /admin/orders/:id | order-service detail + payment-service payment record + inventory reservation history |
| PATCH | /admin/orders/:id/status | proxies to order-service |
| POST | /admin/orders/:id/cancel | proxies |
| GET | /admin/orders/:id/audit | order_status_history + admin metadata |
| GET | /admin/orders/export | CSV (Day 9) |

### Authorization
- Kong validates `role=admin` claim
- admin-bff double-checks via signed `X-User-Role` header on every handler

---

## Frontend — `apps/web` (customer)

### `/orders` (history)
- Reverse-chron list of orders
- Each row: order ID, date, total, status badge with color, item count, primary item thumbnail
- Cursor pagination ("Load more")
- Filter chips: All / Active / Cancelled / Delivered
- Empty state: "No orders yet" + browse CTA

### `/orders/:id` (detail)
- Sections:
  - Order summary (id, placed-at IST, status with timeline)
  - Items table (image, name, variant, qty, price, line total)
  - Shipping address (read-only snapshot)
  - Payment summary (subtotal, shipping, total, payment method, paid-at)
  - Status timeline (each transition with date)
  - Actions:
    - "Download invoice" (when ≥ confirmed)
    - "Cancel order" (only when cancellable per rules) → confirm dialog → API call → status updates inline
    - "Reorder" button (Stage 2 — hidden)
- Live updates: poll `/orders/:id` every 10s while page open and status is non-terminal; stop polling when terminal

### Customer notifications (in-app)
- Toast on status change while user is on the site (driven by polling, not Server-Sent Events in Stage 1)
- "Notifications" list page (`/account/notifications`) — pull from notification-service via admin-bff-equivalent in web-bff (`GET /me/notifications` — paginated list of past sends to this user)

---

## Frontend — `apps/admin`

### `/orders` page
- DataTable with columns: order ID (short, copyable), customer email, total, status badge, item count, placed-at IST, last-updated IST
- Filters: status (multi), date range (date picker), search (order ID / customer email), customer ID
- Sort: placed-at desc default
- Cursor pagination
- Click row → detail
- "Export CSV" button (Day 9)

### `/orders/:id` page
- Full read-only view of the order
- Status transition control: dropdown of valid next states + optional note → "Update Status" button → confirmation dialog → API call → page refreshes
- Cancel button (visible for non-terminal states) → confirm dialog with required reason → API
- Status history timeline showing fromStatus → toStatus, changedBy, changedAt, reason
- Linked customer detail card (click → opens user detail)
- Linked payment record (Razorpay payment ID with link to Razorpay dashboard)
- Linked inventory reservations (release/restock history)

---

## Execution Order
1. order-service admin status endpoints + audit
2. notification-service templates + consumers
3. admin-bff order endpoints
4. Customer order history + detail + live polling
5. Customer cancel flow
6. Customer notifications page
7. Admin orders list + detail
8. Admin status transition flow
9. Admin cancel flow
10. Manual end-to-end test: place order → admin processing → shipped → delivered, with notifications arriving

---

## Definition of Done

| Check |
|---|
| Admin changes status confirmed → processing; customer receives email + SMS within 30s |
| Status timeline reflects all transitions |
| Customer cancels eligible order; inventory released; cancellation email sent |
| Admin cancels with reason; customer notified with reason |
| Invalid transitions (e.g., `delivered → processing`) rejected with 422 |
| Customer cannot cancel `shipped` order (button hidden + server rejects 422) |
| Admin sees full audit trail with admin user names |
| Live polling on customer order detail updates status without refresh |
| Notification page lists past notifications for the user |
| Status badges use consistent colors across customer + admin |

---

## Out of scope today
- Live order tracking (delivery integration — Stage 2)
- Returns + refunds (Stage 2)
- Server-Sent Events / WebSocket push (Stage 2)
- Export CSV (Day 9)
- Bulk admin actions (Stage 2)
