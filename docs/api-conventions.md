# REST API Design Conventions

**Applies to:** Any REST API serving SPA frontends, internal services, or external consumers. Same rules across all of them — consistency over context-specific exceptions.

---

## 1. Goals

- One consistent contract shape across every service in the system
- Predictable, debuggable behavior for client developers
- Safe under network retries and concurrent calls
- Observable by default (correlation IDs on every request)
- Lifecycle-aware — versioned with explicit deprecation
- Machine-verifiable via OpenAPI so conventions don't drift

---

## 2. URL & Resource Naming

| Rule | Convention |
|---|---|
| Resource name | Plural noun (`/products`, `/orders`) |
| Casing | lowercase + kebab-case (`/order-items`) |
| Verbs in URL | Forbidden — HTTP methods are the verbs |
| ID placement | In path for resource lookup (`/orders/{id}`), never query param |
| Nesting depth | Maximum 2 levels (`/orders/{id}/items`); flatten beyond that with query params |
| Non-CRUD actions | Sub-resource POST (`POST /orders/{id}/cancel`, `POST /payments/{id}/refund`) |
| Trailing slashes | Never |
| Plural / singular | Always plural, even for "singleton" resources (`/profiles/me`, not `/profile`) |

---

## 3. HTTP Method Semantics

| Method | Use for | Idempotent | Body |
|---|---|---|---|
| GET | Retrieve | Yes | None |
| POST | Create resource, or action that doesn't fit CRUD | No | Yes |
| PUT | Full replacement of a resource | Yes | Yes |
| PATCH | Partial update | Yes | Yes |
| DELETE | Remove | Yes | None typically |

**Rule:** prefer PATCH over PUT for updates. Full replacement is rarely what clients want, and PATCH avoids the "did I forget a field?" trap.

---

## 4. Status Codes — Minimal Consistent Set

| Code | Meaning | Required headers |
|---|---|---|
| 200 OK | Successful GET / PATCH / PUT | — |
| 201 Created | POST that created a resource | `Location` |
| 202 Accepted | Async operation started | `Location` pointing to status resource |
| 204 No Content | DELETE or action with no body | — |
| 400 Bad Request | Malformed request — cannot parse | — |
| 401 Unauthorized | No or invalid auth | `WWW-Authenticate` |
| 403 Forbidden | Authenticated but not permitted | — |
| 404 Not Found | Resource doesn't exist | — |
| 409 Conflict | State conflict (duplicate, optimistic-lock failure) | — |
| 422 Unprocessable Entity | Parsed but semantically invalid (validation failure) | — |
| 429 Too Many Requests | Rate-limited | `Retry-After` |
| 500 Internal Server Error | Server bug | — |
| 503 Service Unavailable | Temporary unavailability | `Retry-After` |
| 410 Gone | Endpoint sunset after deprecation | — |

**Rule:** use 422 for validation failures, 400 only for unparseable requests. Cleanly separates syntactic from semantic errors.

---

## 5. Request & Response Body

| Concern | Convention |
|---|---|
| Format | `application/json` |
| Key casing | camelCase |
| Timestamps | ISO 8601 in UTC, always with `Z` (`2024-01-15T10:30:00Z`) |
| Dates without time | `YYYY-MM-DD` |
| Money | Integer in minor units + currency code, never floats: amount field + currency field |
| IDs | UUID v7 (time-ordered, globally unique, non-enumerable) |
| Optional ID prefix | Acceptable for human readability (`ord_…`, `usr_…`) — must be consistent per resource type |
| Booleans | Prefixed with `is` / `has` / `can` (`isActive`, `hasShipped`, `canCancel`) |
| Enums | snake_case strings (`order_placed`, `payment_failed`) — never integers, never magic strings |
| `null` vs missing field | `null` = explicitly absent; omitted = not applicable to this representation |
| Empty collections | Return `[]`, not `null` or missing |
| Nested resources | Embed full sub-objects only when always needed by every client; otherwise return IDs and link |

---

## 6. Error Response — Single Shape Across All Services

```
{
  "error": {
    "code": "CART_ITEM_OUT_OF_STOCK",
    "message": "One or more items in your cart are out of stock.",
    "details": { "skus": ["sku_123", "sku_456"] },
    "requestId": "req_8a3b9c..."
  }
}
```

| Field | Rules |
|---|---|
| `code` | Machine-readable, stable, namespaced (`SCOPE_REASON` upper-snake). Frontends switch on this. Once shipped, the code never changes meaning. |
| `message` | User-safe — may be displayed in UI. Never contains internals (stack traces, file paths, DB errors). |
| `details` | Optional, structured. Field-level validation errors, related IDs, suggested actions. |
| `requestId` | Required on every error. Echoes `X-Request-Id` from the request (or one the gateway generated). Support uses it to find logs. |

**Rule:** every service returns exactly this shape on every error. No service invents its own.

---

## 7. Versioning

| Approach | Verdict |
|---|---|
| URL path (`/v1/products`) | ✅ Use this — explicit, gateway-routable, cache-friendly, visible in logs |
| Accept header (`application/vnd.api.v1+json`) | Reject — harder to debug and route |
| Subdomain (`v1.api.example.com`) | Reject — operationally heavy, no benefit |

**Rules:**
- Major versions only in the URL (`v1`, `v2`).
- Backwards-compatible changes (new optional fields, new endpoints) stay in the same version.
- Breaking changes get a new version with a published sunset date for the old one.
- Two versions may coexist; never more than two.

---

## 8. Pagination — Cursor-Based

```
{
  "data": [ … ],
  "page": {
    "nextCursor": "opaqueString",   // null on last page
    "hasMore": true,
    "limit": 20
  }
}
```

| Rule | Detail |
|---|---|
| Style | Cursor-based for all customer-facing lists |
| Offset-based | Allowed only for admin tables where users genuinely need to jump to page N |
| Cursor opacity | Always opaque to the client — typically a base64-encoded compound sort key + ID |
| Default `limit` | 20 |
| Max `limit` | 100 (enforced server-side, regardless of what client sends) |
| Stability | A cursor must continue to work even if items are added/removed mid-scroll |

---

## 9. Idempotency — Required on All Mutations

| Aspect | Rule |
|---|---|
| Header | `Idempotency-Key: <uuid>` on every POST / PATCH / DELETE |
| Client responsibility | Generate a fresh UUID per logical operation; reuse only when retrying the same operation |
| Server responsibility | Store `(idempotencyKey, userId) → response` in a fast KV store for 24 hours; on duplicate, return the cached response byte-for-byte |
| Required on | Order creation, payment, refund, anything that costs money or sends a notification |
| Recommended on | All other POST/PATCH/DELETE — costs nothing extra |
| Key reuse with different body | Return 422 with a clear error code — the key was already used for a different operation |

**Why:** network retries are inevitable. Without idempotency, a transient timeout causes duplicate charges and duplicate orders.

---

## 10. Filtering, Sorting, Field Selection

| Concern | Convention |
|---|---|
| Equality filter | `?status=active&category=electronics` |
| Range filter | Explicit names: `?priceMin=100&priceMax=500` (avoid operator syntax like `price[gte]=100`) |
| Multi-value filter | Comma-separated: `?status=active,paused` |
| Sort | `?sort=-createdAt,name` — leading `-` = descending; comma-separated for multi-key |
| Free-text search | `?q=samsung phone` — keep simple; complex search belongs to a search endpoint backed by a search index, not REST filter params |
| Field selection | `?fields=id,name,price` — return only listed fields; saves bandwidth especially for mobile/list views |
| Expansion / includes | `?include=seller,brand` — embed normally-linked resources when explicitly requested |

---

## 11. Headers

### Request

| Header | Purpose |
|---|---|
| `Authorization: Bearer <token>` | Auth |
| `Content-Type: application/json` | Required on requests with body |
| `Accept: application/json` | Response format |
| `Idempotency-Key: <uuid>` | Required on mutations |
| `X-Request-Id: <uuid>` | Caller-supplied correlation ID; gateway generates if absent |
| `Accept-Language` | Locale hint (when i18n is supported) |

### Response

| Header | Purpose |
|---|---|
| `X-Request-Id` | Always echoed; primary key for log correlation |
| `X-RateLimit-Limit` / `-Remaining` / `-Reset` | Rate-limit status on every response |
| `Retry-After` | On 429 and 503 |
| `Location` | On 201 Created and 202 Accepted |
| `ETag` + `Cache-Control` | Cacheable GETs |
| `Deprecation: true` + `Sunset: <date>` | Lifecycle signals on deprecated endpoints |

---

## 12. File Uploads — Presigned URLs, Not Multipart

| Approach | Verdict |
|---|---|
| `multipart/form-data` to the API server | ❌ Wastes API CPU, blocks request handlers, doesn't scale |
| Presigned object-storage URLs | ✅ Client uploads directly to storage; API only signs and confirms |

**Pattern:**

| Step | Action |
|---|---|
| 1 | Client `POST /uploads` with file metadata → response includes signed upload URL + opaque `fileKey` + expiry |
| 2 | Client uploads directly to object storage using the signed URL |
| 3 | Client calls a confirm endpoint (or the API verifies on subsequent use) to attach the file to a parent resource |

---

## 13. Async Operations

For long-running work (image processing, bulk imports, report generation):

| Step | Detail |
|---|---|
| 1 | `POST` the operation request → `202 Accepted` with `Location: /operations/{id}` |
| 2 | Client polls `GET /operations/{id}` → `{ status: "pending" \| "running" \| "succeeded" \| "failed", result, error }` |
| 3 | Optional: webhook callback on completion as alternative or supplement to polling |

**Rule:** never block on a long-running operation in a synchronous request. If it could exceed a few seconds, make it async.

---

## 14. Response Envelope

| Shape | Use for |
|---|---|
| **Bare body** — the response IS the resource | Single resource responses |
| **Wrapped** — `{ data: [...], page: {...} }` | Collections with pagination metadata |
| `{ error: {...} }` | Always, on any error |

**Rule:** don't wrap single resources just for consistency. Wrapping adds verbosity without value; clients destructure either way.

---

## 15. Documentation — OpenAPI as Source of Truth

| Practice | Detail |
|---|---|
| Spec format | OpenAPI 3.x, one spec per service |
| Location | Checked into the service's repo alongside its code |
| Type generation | Frontend TypeScript types generated from the spec; never hand-written |
| Rendered docs | Auto-published (Swagger UI / Redoc) — always in sync with the spec |
| Lint in CI | Spectral or equivalent enforces these conventions automatically |
| Convention drift | If the spec passes the linter, the API follows the rules — no manual review needed |

---

## 16. Deprecation Lifecycle

| Step | Action |
|---|---|
| Announce | `Deprecation: true` and `Sunset: <ISO date>` headers on every response from the deprecated endpoint |
| Document | Migration guide published in the changelog and developer docs |
| Log | Every call to a deprecated endpoint logged with caller identification |
| Sunset window | Minimum 6 months between deprecation and removal |
| Remove | After sunset, return `410 Gone` with a pointer to the replacement |

---

## 17. Conventions Summary

| Concern | Convention |
|---|---|
| Auth | Bearer JWT in `Authorization` header |
| URL style | Plural noun, kebab-case, max 2 nesting levels |
| Update verb | PATCH (partial) |
| Validation failure | 422 |
| Body casing | camelCase |
| Timestamps | ISO 8601 UTC |
| Money | Integer minor units + currency code |
| IDs | UUID v7, optionally prefixed |
| Enums | snake_case strings |
| Error shape | `{ error: { code, message, details, requestId } }` |
| Versioning | URL path, major only |
| Pagination | Cursor-based |
| Sort syntax | `sort=-field,otherField` |
| Idempotency | `Idempotency-Key` header on every mutation |
| File uploads | Presigned URLs to object storage |
| Async ops | 202 + `/operations/{id}` polling |
| Envelope | Bare for single, wrapped for collections |
| Rate limit signal | `X-RateLimit-*` headers + 429 with `Retry-After` |
| Correlation | `X-Request-Id` request → response |
| Spec | OpenAPI 3.x, linted in CI |

---

## 18. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Verbs in URLs (`/getProducts`, `/createOrder`) | Duplicates the HTTP method; not REST |
| Mixed casing (`/orderItems`) in URLs | URLs are case-sensitive; confusing and bug-prone |
| Floats for money | Loses precision under arithmetic; currency drift |
| Auto-incrementing integer IDs in URLs | Enumerable (security), collide across services (microservices) |
| 200 OK with error in body | Hides failures from monitoring, retries, and proxies; status codes exist for a reason |
| 400 for validation failures | Conflates syntactic and semantic errors |
| Free-form error shapes per service | Frontend has to special-case every service |
| Offset pagination on customer-facing infinite scrolls | Breaks under writes, performs poorly at depth |
| Operator syntax in query params (`price[gte]=100`) | Looks clever, unreadable in logs, hard to validate |
| Skipping `Idempotency-Key` on payments | Retries duplicate charges |
| Multipart uploads through the API | Wastes server CPU; doesn't scale |
| Long-running synchronous endpoints | Times out, blocks workers, no progress visibility |
| Breaking changes without version bump | Silently breaks every client |
| Hand-written API docs out of sync with code | Worse than no docs — clients trust them and get burned |
| Returning internal errors to users (DB messages, stack traces) | Information leak + bad UX |
| Mixing snake_case and camelCase across services | Forces clients to maintain mapping logic |
| Implicit defaults for `limit` with no max cap | One client request can OOM the service |

---

## 19. Decision Summary

| Question | Answer |
|---|---|
| Resource naming style | Plural noun, kebab-case |
| Update method | PATCH |
| Validation status code | 422 |
| JSON casing | camelCase |
| Timestamp format | ISO 8601 UTC |
| Money representation | Integer minor units + currency code |
| ID format | UUID v7 |
| Error shape | Single object with `code`, `message`, `details`, `requestId` |
| Versioning | URL path, major versions only |
| Pagination | Cursor-based, opaque cursor, capped limit |
| Idempotency | Header on every mutation, 24h server-side dedup |
| Filtering | Equality + explicit range params; no operator syntax |
| Sort | `?sort=-field,otherField` |
| Field selection | `?fields=id,name,price` |
| Uploads | Presigned URLs |
| Async ops | 202 + status polling |
| Single resource envelope | Bare |
| Collection envelope | Wrapped with pagination metadata |
| Spec format | OpenAPI 3.x linted in CI |
| Deprecation | 6-month sunset window with headers + migration guide |
