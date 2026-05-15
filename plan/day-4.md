# Day 4 — Catalog, Media, Product Lifecycle

**Goal:** Admins can fully manage the catalog (products with lifecycle states, categories, brands, images). Catalog emits domain events. Customer pages can read product detail.

**Depends on:** Day 2 (auth for admin endpoints).

---

## Backend — catalog-service

### Prisma schema
- `categories` — id, name, slug (unique), parentId (nullable), order, createdAt, updatedAt; depth limit 3 (root → subcategory → leaf)
- `brands` — id, name, slug (unique), createdAt, updatedAt
- `products` — id, sku (unique), slug (unique), name, description (markdown), brandId, categoryId, basePrice (integer, paise), currency (default "INR"), status (enum: draft | published | archived), attributes (jsonb), createdAt, updatedAt, publishedAt (nullable)
- `variants` — id, productId, sku (unique), name (e.g., "Red, M"), price (integer paise, nullable — inherits base), attributes (jsonb)
- `product_media` — productId, mediaId, order, isPrimary
- `outbox` — standard

### Slug rules
- Auto-generated from name on create (kebab-case, ASCII transliteration)
- Editable in admin
- Unique per resource type
- Old slugs preserved in a `slug_history` table for redirects (deferred — not Stage 1)

### Lifecycle
- `draft` — admin-only visibility; not in search index; cannot be added to cart
- `published` — customer-visible; indexed; addable to cart
- `archived` — hidden from customers; remains addressable for existing orders; removed from search

State transitions (admin-only):
- `draft → published` (requires at least 1 image + price > 0)
- `published → archived`
- `archived → draft` (reactivate; must republish)

### Customer endpoints (via web-bff)
| Method | Path | Notes |
|---|---|---|
| GET | /products/:slug | Returns product detail (variants, media URLs, brand, category breadcrumb); only `published` |
| GET | /categories | Full tree |
| GET | /brands | Alphabetical list |

### Admin endpoints
| Method | Path | Notes |
|---|---|---|
| POST | /admin/products | Create as `draft` |
| PATCH | /admin/products/:id | Update fields |
| POST | /admin/products/:id/publish | Validates (≥1 image, price > 0) → status=published |
| POST | /admin/products/:id/archive | status=archived |
| POST | /admin/products/:id/restore | archived → draft |
| POST | /admin/products/:id/media | Attach mediaId (from media-service) |
| DELETE | /admin/products/:id/media/:mediaId | Detach |
| POST | /admin/products/:id/variants | Add variant |
| PATCH | /admin/products/:id/variants/:variantId | Update variant |
| DELETE | /admin/products/:id/variants/:variantId | Remove variant |
| POST | /admin/categories, /admin/brands | CRUD |
| GET | /admin/products | Paginated list with filters: query, status, categoryId, brandId |

### Outbox events
- `Product.Created.v1`, `Product.Updated.v1`, `Product.Published.v1`, `Product.Archived.v1`, `Product.Deleted.v1` (soft-delete; not Stage 1)
- `Category.Created.v1`, `Category.Updated.v1`
- `Brand.Created.v1`, `Brand.Updated.v1`

Note: Search index only consumes `Product.Published.v1` and `Product.Archived.v1` + updates while published. Drafts never indexed.

---

## Backend — media-service

### Prisma schema
- `media_assets` — id, s3Key, contentType, sizeBytes, width, height, status (pending | ready | failed), uploadedBy, altText (nullable), createdAt
- `thumbnails` — id, mediaAssetId, variant (sm | md | lg), s3Key, width, height

### Endpoints
| Method | Path | Notes |
|---|---|---|
| POST | /uploads | Body: `{ contentType, sizeBytes, altText? }`. Validates: image/jpeg, image/png, image/webp; max 10MB. Returns `{ mediaId, uploadUrl, expiresAt }` (5 min). |
| POST | /uploads/:mediaId/confirm | Marks asset confirmed; triggers thumbnail worker |
| GET | /media/:id | Returns `{ original, sm, md, lg }` URLs (signed if private bucket) |
| GET | /media/:id/raw | Redirects to CDN URL |

### Thumbnail worker
- Triggered by S3 ObjectCreated → SQS (local: poll MinIO event)
- Uses `sharp` to generate sm (200×200 max), md (600×600 max), lg (1200×1200 max), all WebP
- Updates `media_assets.status` to `ready` or `failed` (with 3 retries)
- Emits `Media.ProcessingComplete.v1` event (consumers: optional admin UI live update)

### Cleanup
- Pending assets older than 1h → deleted (background sweep)
- Orphaned assets (no `product_media` reference) older than 7 days → deleted

---

## Frontend — `apps/admin`

### Pages
- `/catalog/products` — paginated table (sku, name, status badge, brand, category, price, primary image thumbnail, updatedAt). Filters: query, status, category, brand. Bulk select disabled in Stage 1.
- `/catalog/products/new` — multi-section form: basics (name, sku, description, brand, category), price, attributes (key/value), variants, media (drag-and-drop upload).
- `/catalog/products/:id` — same form, edit mode + status controls (Publish, Archive, Restore buttons depending on state)
- `/catalog/categories` — tree view with add/edit/delete, drag-to-reorder
- `/catalog/brands` — list with add/edit/delete

### Components
- `MediaUploader` — drag-and-drop, shows upload progress, alt-text field per image, reorder via drag, set primary
- `VariantEditor` — table of variants with inline edit
- `AttributeEditor` — key/value pairs with type hints (string/number/boolean)
- `StatusBadge` (draft/published/archived with colors)

### Behaviors
- Form auto-saves to local draft (localStorage) every 10s; cleared on successful save
- Publish button disabled with tooltip if validation fails (need image + price)
- Description supports markdown preview (split view)

---

## Frontend — `apps/web` (customer)

### Pages
- `/p/[slug]` — product detail (SSR, ISR revalidate 60s)
  - Hero image gallery + thumbnails (lazy-loaded)
  - Name, brand link, category breadcrumb
  - Price (Indian formatting: ₹1,000.00)
  - Description (rendered markdown)
  - Variant selector (if multiple)
  - Attributes table
  - Out-of-stock banner placeholder (live data on Day 6)
  - Add to cart button (wired Day 6)
  - "You might also like" placeholder (Day 6)
- `404` for unknown slug

(Listing, home, search pages — Day 5.)

---

## Execution Order
1. Migration + Prisma schema for catalog
2. catalog-service admin endpoints (CRUD)
3. Lifecycle transitions + validation
4. media-service upload + thumbnail worker
5. Outbox + Kafka producers
6. Admin app catalog UI
7. Customer app product detail SSR page

---

## Definition of Done

| Check |
|---|
| Admin creates draft product; appears in admin list with draft badge |
| Image upload via presigned URL; thumbnails generated in seconds |
| Cannot publish without ≥1 image + price > 0 |
| Publish event emitted; product appears on customer `/p/<slug>` |
| Archive removes from customer view |
| Category tree supports 3 levels; reorder works |
| Variants with own SKU + price work |
| Product detail page renders all sections; markdown safely sanitized |
| Description with `<script>` tag does not execute on customer page (XSS-safe) |
| All outbox events visible in Kafka topic |

---

## Out of scope today
- Search & filters (Day 5)
- Cart / wishlist (Day 6)
- Bulk import / export (Stage 2)
- Slug redirects (Stage 2)
