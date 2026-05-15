# admin-bff

**Purpose:** Backend-for-frontend for the admin React+Vite dashboard. Exposes admin-only fields and admin operations. Enforces admin role. Stateless.

## Storage
None.

## Owned Entities
None.

## Key APIs (Composite Responses)

| Area | Endpoints |
|---|---|
| Catalog | List/create/update/delete products, categories, brands; media attach |
| Inventory | View stock levels; adjust quantities; view reservations |
| Orders | List orders with filters; view order detail with full payment + inventory history; update status; cancel |
| Users | List users; view detail; block / unblock |
| Notifications | View recent sends; retry failed |
| Dashboard | Aggregate metrics (orders/day, revenue, stock alerts) — pulled from observability or warehouse, not real-time microservices |

## Events Produced / Consumed
None.

## Dependencies
- All backend services (read-heavy on catalog, inventory, order, identity)

## Notes
- JWT carries `role=admin` claim verified at Kong; admin-bff additionally double-checks role on every handler
- Admin-only fields (cost, margin, internal notes) included in responses; customer-facing BFF never sees these
- Heavier reliance on filters, pagination, exports
- All admin actions logged to audit log via identity-service
