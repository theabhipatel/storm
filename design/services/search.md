# search-service

**Purpose:** Full-text product search, faceted filtering, autocomplete. Pure read model derived from catalog events.

## Storage
- OpenSearch (managed)
- No relational store of its own

## Index

| Index | Holds |
|---|---|
| `products` | One document per product/variant with denormalized fields needed for search and listing |

Key fields indexed: name, description, brand, category, attributes, price, inStock, popularityScore.

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| GET | /search | Full-text search with filters, sort, pagination |
| GET | /autocomplete | Type-ahead suggestions |
| GET | /facets | Available filters for a query (price range, brands, categories) |

## Events Produced
None.

## Events Consumed

| Event | Action |
|---|---|
| Product.Created.v1 | Index new document |
| Product.Updated.v1 | Update document |
| Product.Deleted.v1 | Remove document |
| Category.Updated.v1 | Re-denormalize products in category |
| Brand.Updated.v1 | Re-denormalize products in brand |
| Inventory.StockChanged.v1 | Update `inStock` flag |

## Dependencies
- OpenSearch (AWS managed)

## Notes
- Stateless — can be re-indexed entirely from event replay
- See [design/catalog-search-indexing.md](../catalog-search-indexing.md) for the pipeline
- Eventually consistent with catalog (typical lag < 1s)
