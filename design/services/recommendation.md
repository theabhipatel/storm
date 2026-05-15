# recommendation-service

**Purpose:** Rule-based "you might also like" suggestions. ML-based personalization is Stage 2.

## Storage
- Redis (primary): cached suggestion sets per product / per category
- Reads from catalog events to compute popularity and co-purchase counts

## Owned Entities

| Entity | Key fields |
|---|---|
| ProductRecs | productId, recsList[], computedAt |
| CategoryTopSellers | categoryId, skus[], computedAt |
| CoPurchase | sku, oftenBoughtWith[], score |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| GET | /recs/products/:id | "Similar to this" recs |
| GET | /recs/users/me | Personalized (rule-based) recs |
| GET | /recs/categories/:id/top | Top sellers in a category |

## Events Produced
None.

## Events Consumed

| Event | Action |
|---|---|
| Order.Confirmed.v1 | Increment co-purchase counts; update top sellers |
| Product.Created.v1 | Add to category top-sellers candidates |
| Product.Deleted.v1 | Remove from rec sets |

## Dependencies
- catalog-service (product details for rec list responses)

## Rules (Stage 1)

| Rec type | Rule |
|---|---|
| Product detail page | Same category + nearby price band; fallback to category top sellers |
| User personalization | Top sellers from categories the user has viewed/ordered |
| Cart upsell | Frequently bought with cart items |

## Notes
- All rec sets refreshed every 6h via background job
- Stage 2 swaps rules for ML model behind same APIs
