# web-bff

**Purpose:** Backend-for-frontend for the Next.js customer app. Aggregates microservice calls into page-optimized responses. Stateless.

## Storage
None.

## Owned Entities
None.

## Key APIs (Composite Responses)

| Method | Path | Aggregates |
|---|---|---|
| GET | /home | Top sellers + recommended categories + featured products (catalog + recommendation + search) |
| GET | /products/:id | Product detail + variants + stock + recs (catalog + inventory + recommendation) |
| GET | /search | Pass-through to search-service with shape transform |
| GET | /cart | Cart + each item's fresh price/availability (cart + catalog + inventory) |
| POST | /checkout/init | Validate cart, freeze prices, return checkout payload (cart + catalog + inventory) |
| POST | /orders | Forward to order-service with idempotency key |
| GET | /orders | User's orders with product details denormalized (order + catalog) |
| GET | /wishlist | Wishlist with product details (wishlist + catalog + inventory) |
| GET | /me | User profile (identity) |

## Events Produced / Consumed
None.

## Dependencies
- identity, catalog, search, cart, inventory, wishlist, order, recommendation, media

## Notes
- All downstream calls in parallel where possible
- Per-page response shape; never expose raw microservice responses
- 1–2 s total response budget per page
- Caches only short-TTL (5–30s) Redis cache for hot pages (home, popular products)
