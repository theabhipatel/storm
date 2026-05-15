# Catalog → Search Indexing Pipeline

**Scope:** How product, category, brand, and inventory changes flow from catalog-service (source of truth) into OpenSearch (search read model).

---

## 1. Architecture

```
catalog-service (Postgres)
        │ outbox
        ▼
Kafka (product.* topics)
        │
        ▼
search-service consumer
        │
        ▼
OpenSearch products index
```

Pure event-driven. Search is eventually consistent with catalog (typical lag < 1s).

---

## 2. Producers & Consumers

| Producer | Event | Consumer action |
|---|---|---|
| catalog-service | `Product.Created.v1` | Build denormalized doc; index |
| catalog-service | `Product.Updated.v1` | Update doc (partial or full re-index) |
| catalog-service | `Product.Deleted.v1` | Remove doc |
| catalog-service | `Category.Updated.v1` | Re-denormalize all products in that category |
| catalog-service | `Brand.Updated.v1` | Re-denormalize all products in that brand |
| inventory-service | `Inventory.StockChanged.v1` | Update `inStock` flag on affected doc |

---

## 3. OpenSearch Index Design

**Index:** `products` (one alias `products` pointing to a versioned underlying index, e.g., `products_v1`)

| Field | Type | Notes |
|---|---|---|
| productId | keyword | Primary ID |
| sku | keyword | Searchable exact |
| name | text + keyword | Full-text + sortable |
| description | text | Full-text |
| brandId / brandName | keyword | Facet + filter |
| categoryId / categoryPath | keyword (array) | Hierarchical facet |
| attributes.* | dynamic (typed at template) | JSONB attributes mapped per category |
| basePrice | double | Range filter, sort |
| inStock | boolean | Filter |
| popularityScore | double | Sort tiebreaker |
| createdAt | date | Sort (newness) |
| imageUrl | keyword | First image URL for listing |

**Analyzers:**

| Analyzer | Used on |
|---|---|
| `standard` | description |
| `edge_ngram (autocomplete)` | name (autocomplete) |
| `lowercase keyword` | brand, category names |

---

## 4. Denormalization

The doc embeds brand name, category names, and image URL — not just IDs — so a search query is a single OpenSearch call.

When brand or category names change, search-service consumes `Brand.Updated` / `Category.Updated` and triggers a re-index of affected products (queryable via stored IDs).

---

## 5. Re-Indexing Strategy

| Trigger | Action |
|---|---|
| Single product change | Update document in place |
| Mapping change (new field, analyzer change) | Build a new versioned index (`products_v2`); replay all `Product.*` events; atomic alias swap |
| Full rebuild after data corruption | Replay all events from Kafka retention; if retention exceeded, paginate catalog DB |

Aliases enable zero-downtime reindexing.

---

## 6. Idempotency & Ordering

| Concern | Handling |
|---|---|
| Duplicate events | Dedup by `eventId` in a processed-events table |
| Out-of-order events | Each event carries `occurredAt`; consumer discards updates older than current doc's `updatedAt` |
| Partition ordering | Catalog events partitioned by `productId` so all events for one product are ordered |

---

## 7. Failure Handling

| Failure | Handling |
|---|---|
| OpenSearch transient error | Retry with exponential backoff in consumer |
| OpenSearch persistent error | DLQ event; alert; manual replay after recovery |
| Schema mismatch (new field unknown) | Index dynamically (allowed) or alert and DLQ depending on field criticality |
| Catalog event lost | Background reconciliation job compares catalog row count vs index doc count nightly |

---

## 8. Performance Targets

| Metric | Target |
|---|---|
| Indexing lag (event → searchable) | p99 < 5 s |
| Search query latency | p99 < 100 ms |
| Autocomplete latency | p99 < 50 ms |
| Re-index throughput (full rebuild) | ≥ 1000 docs/sec |
