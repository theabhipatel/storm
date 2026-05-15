# wishlist-service

**Purpose:** Per-user wishlists.

## Storage
- Postgres

## Owned Entities

| Entity | Key fields |
|---|---|
| Wishlist | userId (PK), createdAt |
| WishlistItem | wishlistId, sku, addedAt |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| GET | /wishlist | Current user's wishlist |
| POST | /wishlist/items | Add item |
| DELETE | /wishlist/items/:sku | Remove item |
| POST | /wishlist/items/:sku/move-to-cart | Move to cart |

## Events Produced
None (Stage 1).

## Events Consumed

| Event | Action |
|---|---|
| Product.Deleted.v1 | Remove from all wishlists |

## Dependencies
- catalog-service (for product details on list view)
- cart-service (for move-to-cart)

## Notes
- One wishlist per user
- Max items: 200 per user (enforced)
