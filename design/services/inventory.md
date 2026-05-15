# inventory-service

**Purpose:** Authoritative stock levels per SKU; reservations during checkout with TTL.

## Storage
- Postgres (primary): stock_items, reservations, outbox
- Redis: hot stock cache, rate limits

## Owned Entities

| Entity | Key fields |
|---|---|
| StockItem | sku, quantityOnHand, quantityReserved, version (optimistic lock), updatedAt |
| Reservation | id, sku, qty, orderId, status (active/confirmed/released), expiresAt, createdAt |
| Outbox | standard outbox |

## Key APIs (gRPC primarily; REST for admin)

| Method | RPC / Path | Purpose |
|---|---|---|
| gRPC | Reserve(items[], orderId, ttl) | Reserve stock for checkout |
| gRPC | ConfirmReservation(reservationId) | Convert reservation to permanent decrement on order confirmation |
| gRPC | Release(reservationId) | Release reservation (compensation) |
| gRPC | GetStock(skus[]) | Read current available stock |
| GET | /admin/stock | List stock levels |
| PATCH | /admin/stock/:sku | Adjust quantity (admin) |

## Events Produced

| Event | When |
|---|---|
| Inventory.Reserved.v1 | Reservation created |
| Inventory.Released.v1 | Reservation released |
| Inventory.StockChanged.v1 | Stock level changed (admin adjustment or confirmed order) |

## Events Consumed

| Event | Action |
|---|---|
| Order.Confirmed.v1 | Confirm matching reservation (permanent decrement) |

## Dependencies
None.

## Concurrency
- Optimistic locking on `version` for normal updates
- Pessimistic locking (`SELECT … FOR UPDATE`) only under flash-sale contention
- Background job sweeps expired reservations every 60s and releases them

## Notes
- Reservation TTL default: 15 minutes
- Available stock = `quantityOnHand - quantityReserved`
