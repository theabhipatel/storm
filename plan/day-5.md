# Day 5 — Search, Listings, Filtering, Sorting

**Goal:** Customers can search, filter, sort products. Category and home pages are live. OpenSearch indexed via Kafka events.

**Depends on:** Day 4 (catalog with published products).

---

## Backend — search-service

### OpenSearch index `products_v1` (alias `products`)
Mapping:
| Field | Type | Purpose |
|---|---|---|
| productId | keyword | id |
| sku | keyword | exact match |
| name | text + keyword | full-text + sort/aggregate |
| description | text | full-text |
| brandId | keyword | filter |
| brandName | keyword + text | facet, search |
| categoryId | keyword (array — ancestors) | hierarchical filter |
| categoryNames | keyword (array) | facet |
| attributes | object (flattened) | filter |
| basePrice | integer | range + sort |
| inStock | boolean | filter |
| popularityScore | float | sort |
| createdAt | date | sort (newness) |
| primaryImageUrl | keyword | listing |
| status | keyword | indexed only when `published` |

Analyzers:
- `name`: standard + edge_ngram (2–10) for autocomplete
- `description`: standard
- `brand/categoryName`: lowercase keyword

### Consumers
- `Product.Published.v1` → index doc
- `Product.Updated.v1` (when status=published) → update doc
- `Product.Archived.v1` → remove doc
- `Category.Updated.v1` → re-denormalize affected products
- `Brand.Updated.v1` → re-denormalize affected products
- `Inventory.StockChanged.v1` (Day 6) → update `inStock`

Dedup by `eventId`. Out-of-order check via `occurredAt` vs `updatedAt`.

### Search APIs
| Method | Path | Notes |
|---|---|---|
| GET | /search | Query params: `q`, `categoryId`, `brandId` (multi via comma), `priceMin`, `priceMax`, `inStock` (bool), `sort` (relevance \| price-asc \| price-desc \| popularity \| newness), `cursor`, `limit` (default 20, max 100). Returns `{ data: [], page: { nextCursor, hasMore, limit } }` per `docs/api-conventions.md` §8 |
| GET | /autocomplete | `?q=` returns up to 10 suggestions (product names + categories) |
| GET | /facets | `?q=&filters=` returns available filters with counts (brands, categories, price buckets, in-stock toggle) |

### Sort behavior
- `relevance` (default): BM25 + popularity boost
- `price-asc`/`price-desc`: by basePrice
- `popularity`: by popularityScore
- `newness`: by createdAt desc

### Re-indexing
- Versioned indices with alias swap (`products_v1` → `products_v2`)
- Admin endpoint: `POST /admin/reindex` (triggers full rebuild from catalog event replay)

---

## Backend — web-bff (extensions)

| Method | Path | Notes |
|---|---|---|
| GET | /home | Composite: top 8 categories + 12 top-sellers + 4 featured brands. Cached 30s in Redis (`web-bff:home:v1`). |
| GET | /search | Pass-through to search-service with shape transform; preserves all query params |
| GET | /c/:slug | Resolves category by slug → calls search-service filtered to that category tree |

### Caching
- Per `design/services/web-bff.md` updated caching section: `web-bff:<page>:<entity>:<id>:<version>` keys, TTL 30s for listings, event-driven invalidation on `Product.*` and `Category.*`
- Single-flight on `/home`

---

## Frontend — `apps/web`

### Pages
- `/` — home (SSR)
  - Hero (placeholder image / banner)
  - Top categories grid (8)
  - Top sellers carousel
  - Featured brands strip
- `/c/[categorySlug]` — category listing (SSR, ISR 60s)
  - Breadcrumb
  - Filter sidebar (Day 5 features below) + sort dropdown
  - Product grid (cursor-paginated via "Load more")
  - Subcategory chips at top
- `/search` — search results (CSR — query-driven)
  - Search bar in header (live autocomplete dropdown)
  - Same filters/sort/grid as category
  - "No results" empty state with suggestions

### Filter sidebar (used on /c/* and /search)
- Price range (slider with min/max inputs, INR)
- Brand (checkbox list with counts from facets)
- Category (when not already filtered; shows tree with counts)
- In stock only (toggle)
- "Clear all filters" button
- Filters reflected in URL query string (shareable, back-button friendly)
- Mobile: filter drawer (slide-up)

### Sort dropdown
- Options: Relevance (default), Price: low to high, Price: high to low, Popular, Newest

### Product card (reused across home/category/search/wishlist/recs)
- Image (lazy, 1:1 aspect)
- Name (line-clamp 2)
- Brand (small text)
- Price (Indian formatted: ₹1,099.00)
- "Add to wishlist" heart icon (auth-gated; redirects to login if anonymous)
- Out-of-stock badge if `inStock=false`

### Autocomplete
- Debounced 150ms
- Shows up to 10 results (products with image + name + price + categories)
- Arrow keys + Enter navigation
- "Search for 'foo'" footer item

### URL state
- All search/filter/sort state encoded in URL — pasteable, bookmarkable
- Pagination uses `?cursor=` (opaque)

### Empty states
- Category with no products: "No products in this category yet."
- Search with no results: "No matches for 'foo'. Try different keywords or remove filters." + suggested categories
- Filter combination with no results: "No products match your filters." + Clear filters button

---

## Execution Order
1. Index template + mapping in OpenSearch
2. search-service consumers + dedup
3. Search API endpoints
4. web-bff /home, /search, /c/*
5. Customer app header search bar + autocomplete
6. Customer app home page
7. Category listing page
8. Search results page with filters + sort
9. Re-index admin endpoint
10. Manual e2e test: create published product → appears in search within seconds

---

## Definition of Done

| Check |
|---|
| Newly published product is searchable within 5 seconds |
| Edit price; new price reflects in search within 5 seconds |
| Archive product; disappears from search |
| Search by name + filter by brand + sort by price-asc works |
| Pagination via cursor works; "Load more" appends |
| Autocomplete shows live suggestions as user types |
| Filters reflected in URL; browser back/forward preserves state |
| "No results" empty state shows when nothing matches |
| Mobile filter drawer works |
| Home page renders <1.5s LCP locally |
| Re-index endpoint rebuilds `products_v2` and swaps alias atomically |

---

## Out of scope today
- Cart / wishlist behaviors (Day 6)
- Reviews & ratings (Stage 2)
- Personalized search (Stage 2)
