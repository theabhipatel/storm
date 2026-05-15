# Event Catalog

**Scope:** All Kafka topics in Storm Stage 1, with producer, consumers, and payload summary.

All events follow the standard envelope from [docs/event-driven-architecture.md](../docs/event-driven-architecture.md): `eventId`, `eventType`, `occurredAt`, `producer`, `traceId`, `data`.

Topic naming: `<Aggregate>.<Event>.v<N>`, PascalCase, past tense (e.g., `Order.Confirmed.v1`).

---

## Identity Domain

| Event | Producer | Consumers | Payload (`data`) |
|---|---|---|---|
| `User.Created.v1` | identity-service | notification-service (welcome email) | userId, email, name, createdAt |
| `User.Blocked.v1` | identity-service | notification-service | userId, reason, blockedBy |
| `User.Unblocked.v1` | identity-service | notification-service | userId, unblockedBy |
| `User.PasswordChanged.v1` | identity-service | notification-service | userId, changedAt |
| `User.OtpRequested.v1` | identity-service | notification-service (SMS via Twilio) | userId, mobile, otpCode |
| `User.EmailVerificationRequested.v1` | identity-service | notification-service | userId, email, token |
| `User.PasswordResetRequested.v1` | identity-service | notification-service | userId, email, token |
| `User.NewDeviceLogin.v1` | identity-service | notification-service | userId, deviceInfo, ip, loginAt |
| `User.EmailChanged.v1` | identity-service | notification-service | userId, oldEmail, newEmail |
| `User.MobileChanged.v1` | identity-service | notification-service | userId, newMobile |
| `User.Deleted.v1` | identity-service | notification-service | userId, deletedAt |

---

## Catalog Domain

| Event | Producer | Consumers | Payload (`data`) |
|---|---|---|---|
| `Product.Created.v1` | catalog-service | search-service, recommendation-service | productId, sku, name, basePrice, categoryId, brandId, attributes, status |
| `Product.Updated.v1` | catalog-service | search-service, cart-service (price refresh), recommendation-service | productId + changed fields |
| `Product.Published.v1` | catalog-service | search-service (index doc), recommendation-service | productId |
| `Product.Archived.v1` | catalog-service | search-service (remove doc), cart-service, wishlist-service, recommendation-service | productId |
| `Product.Deleted.v1` | catalog-service | search-service, cart-service, wishlist-service, recommendation-service | productId |
| `Category.Created.v1` / `Updated.v1` | catalog-service | search-service | categoryId, name, parentId |
| `Brand.Created.v1` / `Updated.v1` | catalog-service | search-service | brandId, name |

---

## Inventory Domain

| Event | Producer | Consumers | Payload (`data`) |
|---|---|---|---|
| `Inventory.Reserved.v1` | inventory-service | (audit) | reservationId, orderId, items, expiresAt |
| `Inventory.Released.v1` | inventory-service | (audit) | reservationId, reason |
| `Inventory.StockChanged.v1` | inventory-service | search-service (inStock flag) | sku, quantityOnHand |

---

## Order Domain

| Event | Producer | Consumers | Payload (`data`) |
|---|---|---|---|
| `Order.Created.v1` | order-service | (analytics, deferred) | orderId, userId, totalAmount, items |
| `Order.Confirmed.v1` | order-service | notification-service, cart-service, recommendation-service, inventory-service (convert reservation) | orderId, userId, items, totalAmount, paidAt |
| `Order.Failed.v1` | order-service | notification-service | orderId, userId, reason |
| `Order.StatusChanged.v1` | order-service | notification-service | orderId, userId, previousStatus, newStatus |
| `Order.Cancelled.v1` | order-service | notification-service, inventory-service | orderId, userId, cancelledBy |

---

## Payment Domain

| Event | Producer | Consumers | Payload (`data`) |
|---|---|---|---|
| `Payment.Captured.v1` | payment-service | order-service | paymentId, orderId, amount, method, razorpayPaymentId |
| `Payment.Failed.v1` | payment-service | order-service, notification-service | paymentId, orderId, reason |

---

## Cart Domain

| Event | Producer | Consumers | Payload (`data`) |
|---|---|---|---|
| `Cart.ItemAdded.v1` | cart-service | (analytics, deferred) | userId, sku, qty |

---

## Media Domain

| Event | Producer | Consumers | Payload (`data`) |
|---|---|---|---|
| `Media.Uploaded.v1` | media-service | (catalog admin UI via WebSocket only) | mediaId, s3Key, contentType |
| `Media.ProcessingComplete.v1` | media-service | (catalog admin UI) | mediaId, thumbnails |

---

## Conventions

| Concern | Convention |
|---|---|
| Topic name | `<Aggregate>.<Event>.v<N>` (PascalCase, past tense) |
| Partition key | Aggregate ID (orderId, userId, productId, etc.) |
| Schema location | `packages/contracts/events` (Stage 1) → schema registry (later) |
| Delivery | At-least-once; consumers idempotent on `eventId` |
| Outbox | All producers use transactional outbox |
| DLQ | `<topic>.dlq` per topic; alert on growth |

---

## Topic Sizing (Initial)

| Topic class | Partitions | Replication |
|---|---|---|
| High volume (order, inventory, product updates) | 12 | 3 |
| Medium (user, payment, cart) | 6 | 3 |
| Low (media, audit) | 3 | 3 |

Partition count cannot be reduced — start moderately, scale up later.
