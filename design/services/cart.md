# cart-service

**Purpose:** Per-user shopping cart with low-latency reads and writes.

## Storage
- Redis (primary): cart state per user
- Postgres (durability): periodic snapshot + on-write replication for recovery

## Owned Entities

| Entity | Key fields |
|---|---|
| Cart | userId, items[], updatedAt |
| CartItem | sku, qty, priceSnapshot, addedAt |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| GET | /cart | Get current user's cart |
| POST | /cart/items | Add item |
| PATCH | /cart/items/:sku | Update quantity |
| DELETE | /cart/items/:sku | Remove item |
| DELETE | /cart | Clear cart |

## Events Produced

| Event | When |
|---|---|
| Cart.ItemAdded.v1 | For analytics (deferred consumer) |

## Events Consumed

| Event | Action |
|---|---|
| Order.Confirmed.v1 | Clear that user's cart |
| Product.Updated.v1 (price changes) | Refresh `priceSnapshot` on next read; flag price-changed items in UI |
| Product.Deleted.v1 | Remove item from all carts |

## Dependencies
- catalog-service (for fresh price lookup on read)
- inventory-service (availability check at read time)

## Notes
- Cart is best-effort; expires after 30 days idle
- Anonymous carts (pre-login) live in localStorage; merged into the server cart on login
