# catalog-service

**Purpose:** Source of truth for products, categories, brands, and variants. Search reads are delegated to search-service.

## Storage
- Postgres (JSONB for variant attributes)

## Owned Entities

| Entity | Key fields |
|---|---|
| Product | id, sku, name, slug, description, brandId, categoryId, basePrice, currency, status, attributes (JSONB), createdAt, updatedAt |
| Variant | id, productId, sku, price, attributes (JSONB) |
| Category | id, name, slug, parentId |
| Brand | id, name, slug |
| ProductMedia | productId, mediaId, order |
| Outbox | id, aggregateId, eventType, payload, createdAt, publishedAt |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| GET | /products | List products (basic) — heavy reads go through search-service |
| GET | /products/:id | Get one product (full detail) |
| GET | /categories | Category tree |
| GET | /brands | Brand list |
| POST | /admin/products | Create product |
| PATCH | /admin/products/:id | Update product |
| DELETE | /admin/products/:id | Soft-delete product |
| POST | /admin/categories | Create category |
| POST | /admin/brands | Create brand |

## Events Produced

| Event | When |
|---|---|
| Product.Created.v1 | New product created |
| Product.Updated.v1 | Product edited (price, attributes, status) |
| Product.Deleted.v1 | Product soft-deleted |
| Category.Created.v1 / Updated.v1 | Category changes |
| Brand.Created.v1 / Updated.v1 | Brand changes |

All events emitted via transactional outbox.

## Events Consumed
None.

## Dependencies
- media-service (image metadata)

## Notes
- JSONB stores category-specific attributes (e.g., `{ ram: "16GB", cpu: "i7" }` for laptops)
- All catalog mutations emit events → search-service rebuilds index
