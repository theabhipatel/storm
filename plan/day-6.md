# Day 6 — Cart, Inventory, Wishlist, Recommendations

**Goal:** Customers add to cart, manage wishlist, see recommendations. Inventory exposes gRPC reservation API for checkout. Stock state reflects in search.

**Depends on:** Day 4 (catalog), Day 5 (search index).

---

## Backend — cart-service

### Redis schema
- `cart:<userId>` (hash) — items, updatedAt, addressId (chosen later at checkout)
- `cart-item:<userId>:<sku>` not needed — full cart stored as single hash
- AOF + RDB enabled in docker-compose and ElastiCache settings

### Item shape (stored in cart hash)
- sku, productId, variantId (nullable), qty, priceSnapshot, currency, addedAt, priceChangedFlag (set when product price differs from snapshot)

### Limits
- Max 50 distinct items per cart
- Max 10 qty per SKU
- Reject violating requests with 422 + error code `CART_LIMIT_EXCEEDED`

### Endpoints
| Method | Path | Notes |
|---|---|---|
| GET | /cart | Returns cart with fresh prices + availability (cross-checks catalog + inventory). If a product price has changed, item shows `priceChanged=true` with both `priceSnapshot` and `currentPrice`. |
| POST | /cart/items | Body: `{ productId, variantId?, qty }`. Validates product is `published`. Stores price snapshot. |
| PATCH | /cart/items/:sku | Body: `{ qty }`. Validate qty 1–10. |
| DELETE | /cart/items/:sku | Remove |
| DELETE | /cart | Clear entire cart |
| POST | /cart/merge | Body: `{ items: [...] }` — called when anonymous user logs in. Merge rule: sum quantities (cap 10/SKU); refresh prices; remove out-of-stock items. |

### Events
- Consumes: `Order.Confirmed.v1` → clear cart; `Product.Updated.v1` → mark priceChangedFlag if relevant; `Product.Archived.v1`/`Product.Deleted.v1` → remove item; `Inventory.StockChanged.v1` → mark unavailable if stock reaches 0
- Emits: `Cart.ItemAdded.v1` (for future analytics)

### Idle expiry
- Cart key TTL: 30 days, refreshed on every read/write

---

## Backend — inventory-service

### Prisma schema
- `stock_items` — sku (PK), productId, quantityOnHand, quantityReserved, lowStockThreshold (default 5), version (optimistic lock), updatedAt
- `reservations` — id, sku, qty, orderId, status (active | confirmed | released), createdAt, expiresAt
- `stock_movements` — id, sku, delta (signed), reason (string), reservationId (nullable), occurredAt (audit)
- `outbox`, `processed_events`

### gRPC service (proto in `packages/contracts/proto/inventory.proto`)
- `Reserve(items[], orderId, ttlSeconds=900)` → returns `reservationId` or rejection (e.g., insufficient stock per sku)
- `ConfirmReservation(reservationId)` → atomic permanent decrement
- `Release(reservationId)` → release reservation, restore reserved count
- `GetStock(skus[])` → returns available stock per sku
- `Restock(orderId)` — used on cancellation post-confirmation, reverses confirmed decrement

### REST admin endpoints (used by admin-bff)
| Method | Path | Notes |
|---|---|---|
| GET | /admin/stock | Paginated; filters: lowStockOnly, sku, productId, query |
| GET | /admin/stock/:sku | Detail incl. recent movements + active reservations |
| PATCH | /admin/stock/:sku | Manual adjustment with reason text; emits `Inventory.StockChanged.v1`; logs movement |
| GET | /admin/low-stock-alerts | Skus where `quantityOnHand <= lowStockThreshold` |

### Concurrency
- Optimistic locking on `stock_items.version`
- Pessimistic (`SELECT ... FOR UPDATE`) only inside `Reserve` to avoid oversell

### Background workers
- Reservation TTL sweep — every 60s releases expired `active` reservations + emits `Inventory.Released.v1`
- Low-stock alert: hourly job emits `Inventory.LowStock.v1` for skus crossing threshold (notification consumed by admin-only template)

### Events
- Consumes: `Order.Confirmed.v1`, `Order.Failed.v1`, `Order.Cancelled.v1`
- Emits: `Inventory.Reserved.v1`, `Inventory.Released.v1`, `Inventory.StockChanged.v1`, `Inventory.LowStock.v1`

---

## Backend — wishlist-service

### Prisma schema
- `wishlists` — userId (PK), createdAt
- `wishlist_items` — wishlistId, sku, addedAt; unique(wishlistId, sku)

### Limits
- Max 200 items per wishlist

### Endpoints
| Method | Path | Notes |
|---|---|---|
| GET | /wishlist | List items with product details + current price + availability (calls catalog + inventory) |
| POST | /wishlist/items | Body: `{ sku }`. Idempotent (duplicate is a no-op success). |
| DELETE | /wishlist/items/:sku | Remove |
| POST | /wishlist/items/:sku/move-to-cart | Adds to cart (qty=1) then removes from wishlist |

### Events
- Consumes: `Product.Deleted.v1`, `Product.Archived.v1` → remove from all wishlists

---

## Backend — recommendation-service

### Redis schema
- `recs:product:<id>` (set with scores) — TTL 6h
- `recs:category:<id>:top` — sorted set with popularity scores
- `recs:user:<id>` — personalized list, TTL 1h
- `co-purchase:<sku>` (sorted set with counts) — built from `Order.Confirmed.v1` consumption

### Endpoints
| Method | Path | Notes |
|---|---|---|
| GET | /recs/products/:id | Returns up to 8 product IDs; rule: same category + nearby price ±25%, sorted by popularity. Fallback: category top sellers. |
| GET | /recs/users/me | Personalized: top sellers in user's recently viewed categories. Fallback: site-wide top sellers. |
| GET | /recs/categories/:id/top | Top sellers in category |

### Background jobs
- Refresh `recs:product:*` every 6h
- Refresh `recs:category:*:top` hourly
- Refresh `recs:user:*` on demand (lazy, on first request after expiry)

### Events
- Consumes: `Order.Confirmed.v1` (co-purchase counts + popularity), `Product.Created.v1`, `Product.Archived.v1`

---

## Backend — web-bff (extensions)

| Method | Path | Notes |
|---|---|---|
| GET | /cart | Composite: cart + fresh data |
| POST | /cart/* | Pass-through to cart-service |
| GET | /wishlist | Pass-through |
| POST | /wishlist/* | Pass-through |
| GET | /products/:slug | Now includes "you might also like" from recommendation-service |
| POST | /checkout/init | (used Day 7) |

---

## Frontend — `apps/web`

### Cart drawer + page
- Header cart icon shows item count badge (live, updates on add/remove)
- Clicking cart icon opens drawer with summary + "Go to cart" link
- `/cart` page:
  - List of items: image, name, variant, price, qty stepper, remove button
  - Price-changed warning banner per item ("Price updated from ₹999 to ₹1,049")
  - Out-of-stock banner per item if applicable (disable qty stepper, show "Remove")
  - Subtotal calculation
  - "Proceed to Checkout" button (auth-required → redirects to login with `returnTo` param)
  - Empty state: "Your cart is empty" + "Browse products" CTA

### Wishlist page (`/wishlist`)
- Grid of product cards
- "Move to cart" button per item
- Remove button per item
- Empty state with CTA

### Add-to-cart on product detail (`/p/[slug]`)
- Quantity selector (1–10)
- "Add to Cart" primary button — shows toast on success
- "Add to Wishlist" heart icon — toggle state, toast on add
- If out of stock: disable Add to Cart; show "Notify when back" placeholder (deferred to Stage 2 — show as disabled button with tooltip)

### Recommendations widget
- Used on:
  - Product detail (under main info: "You might also like")
  - Cart page (above cart: "Often bought together" — uses /recs/products/:id of first cart item)
  - Empty cart state ("Popular right now" — uses /recs/users/me)
- Carousel layout, 4–6 cards visible, swipeable on mobile

### Anonymous cart
- Stored in `localStorage` until login
- On login, `POST /cart/merge` with localStorage contents; clear localStorage
- Drawer + page work identically before/after login

### Authentication-gated actions
- Adding to wishlist while logged out → redirect to login with `returnTo` + replay the action after login
- Same for "Move to cart from wishlist" (won't apply pre-login)

---

## Frontend — `apps/admin` (inventory pages)

- `/inventory` — table of stock items (sku, productName, onHand, reserved, threshold, lastUpdated). Filters: lowStockOnly, search. Click row → adjustment modal.
- `/inventory/:sku` — detail panel: current state, recent movements, active reservations. Adjustment form: delta (+/-) + reason text (required).
- `/inventory/alerts` — list of low-stock SKUs with quick-adjust action

---

## Execution Order
1. inventory-service migrations + gRPC server + reservation logic + sweep
2. cart-service Redis schema + endpoints + merge logic
3. wishlist-service endpoints
4. recommendation-service rules + Redis cache + jobs
5. web-bff cart/wishlist/recs composites
6. Customer app cart drawer + page
7. Customer app wishlist page
8. Add-to-cart wired on product detail
9. Recommendations widgets
10. Admin inventory pages

---

## Definition of Done

| Check |
|---|
| Add product to cart from product detail; cart icon badge updates |
| Anonymous cart persists; on login merges; price refresh + out-of-stock removal applied |
| qty controls respect max-10 and max-50-items rules |
| Price-change warning shows when product price differs from snapshot |
| Remove from cart works; empty state shown when last item removed |
| Wishlist add/remove/move-to-cart works; max-200 enforced |
| Recommendation widget shows on product detail with 8 items |
| Recommendation widget on empty cart shows top sellers |
| Inventory gRPC: reserve → confirm → permanent decrement; reserve → release → restored |
| Concurrent reserves for last unit: one wins, one gets `INSUFFICIENT_STOCK` |
| Reservation TTL sweep releases expired reservations |
| Admin adjusts stock; `Inventory.StockChanged.v1` emitted; search index updates `inStock` |
| Low-stock alert generated when threshold crossed |

---

## Out of scope today
- Checkout flow (Day 7)
- Order placement (Day 7)
- "Notify me when in stock" (Stage 2)
- Save for later (Stage 2)
