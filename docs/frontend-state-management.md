# Frontend State Management Architecture

**Applies to:** Any React-based SPA (Next.js or Vite) using TypeScript that talks to a REST backend.

**Stack:** Redux Toolkit + RTK Query (server state) + `createSlice` (client state) + Axios (transport).

---

## 1. Goals

- Server state is cached, deduplicated, and invalidated in one place
- Client state is kept minimal — only what does not exist on the server
- UI is fully decoupled from data fetching and the store
- One transport with shared cross-cutting concerns (auth, CSRF, refresh, error normalization)
- Same mental model across every feature, so any developer can move between features without re-learning

---

## 2. Core Principle — Two Kinds of State

| Kind | Definition | Lives in |
|---|---|---|
| **Server state** | Any data that originated from an API call | RTK Query cache |
| **Client state** | UI flags, multi-step form drafts, ephemeral interaction state, in-memory tokens | `createSlice` |

**Rule:** if it came from an API, it never enters `createSlice`. Mixing the two is the most common cause of stale data, duplicate sources of truth, and difficult bugs.

---

## 3. Layered Architecture

```
UI components  (presentation only)
        │ call feature hooks
        ▼
Feature hooks  (the UI's only public surface)
        │
        ▼
API slices  (one per feature — endpoints + tags)
        │ via custom baseQuery
        ▼
Custom baseQuery  (thin RTK Query ↔ axios bridge)
        │
        ▼
Axios instance  (configured once, interceptors attached)
        ▼
Backend
```

**Strict import rule:** components import only from a feature's hooks file. Components never import the axios instance, the store, slices, or API definitions directly.

---

## 4. Folder Structure (Feature-Sliced)

```
src/
  app/                              framework entry (routes / main.tsx)
  store/                            store config, typed hooks, root types
  lib/
    axios                           the single axios instance + interceptors
    baseQuery                       the RTK Query ↔ axios adapter
    tokenStore                      in-memory access token singleton
    apiError                        normalized error type + converter
  features/
    <feature>/
      <feature>.api                 createApi: endpoints, tags
      <feature>.slice               client-only state (if any)
      <feature>.hooks               re-exports + composition of hooks
      <feature>.types               feature-specific TS types
```

Everything for a feature lives in one folder. New features follow the same shape. No cross-feature reaching — features communicate via the store, not by importing each other's internals.

---

## 5. Layer Responsibilities

### 5.1 Axios instance (`lib/axios`)
- Created **once** per app. Never instantiated ad-hoc anywhere else.
- Holds base URL, credentials flag, default headers, and the request/response interceptors.
- Knows nothing about Redux.

### 5.2 Interceptors
Three cross-cutting concerns live here, and only here:
1. **Auth header** — attach the access token to outgoing requests.
2. **CSRF header** — attach the CSRF token on cookie-bearing endpoints.
3. **Silent refresh** — on a 401, call the refresh endpoint, retry the original request. Use a **single in-flight refresh promise** so N concurrent 401s trigger one refresh, not N.
4. **Error normalization** — convert every axios error into the app's single `ApiError` shape before rejecting.

### 5.3 Custom baseQuery (`lib/baseQuery`)
- The thinnest possible adapter that lets RTK Query route through axios instead of `fetch`.
- Required so RTK Query inherits the interceptor stack.
- Contains no business logic — pure transport translation.

### 5.4 API slice (per feature)
- Defines all endpoints for one feature (queries and mutations).
- Declares **tag types** for cache coherence.
- Each query declares `providesTags`; each mutation declares `invalidatesTags`.
- Exports auto-generated hooks for components/hooks to consume.

### 5.5 Client slice (per feature, only when needed)
- Holds **only** state that has no server representation.
- Examples: which step of checkout is active, draft form data before submission, whether a drawer is open, in-memory user object cached from `/me`.
- Never holds lists, entities, or any data also returned by an API.

### 5.6 Feature hooks file
- The feature's **public API to the rest of the app**.
- Re-exports the auto-generated hooks under domain names (`useGetCartQuery` → `useCart`).
- Composes generated hooks with client state when a feature needs both (e.g., `useAuth` combining the login mutation with the current-user slice).
- This indirection layer is what allows the underlying store implementation to change later without touching components.

### 5.7 Components
- Receive data and callbacks from hooks. That's it.
- No `useEffect` for data fetching. No direct `dispatch`. No selectors. No axios.

---

## 6. Cache Invalidation via Tags

A simple, declarative contract:

1. Every query **provides** one or more tags identifying the data it returns.
2. Every mutation **invalidates** the tags affected by its write.
3. When a mutation succeeds, every query providing matching tags is refetched automatically.

**Tag-naming convention:** PascalCase singular type per entity (`Cart`, `Order`, `Product`). Specific entity tags use `{ type, id }`; collection-level tags use `{ type }` alone.

**Result:** no component ever calls `refetch()` after a mutation. The cache stays coherent without imperative orchestration.

---

## 7. Auth Integration (Transport Layer)

| Concern | Where it lives |
|---|---|
| Access token | In-memory singleton (`tokenStore`). Never `localStorage`, `sessionStorage`, or any cookie. |
| Refresh token | `httpOnly` cookie set by the server; browser handles transmission automatically. |
| CSRF token | Non-`httpOnly` cookie read by axios interceptor on cookie-bearing endpoints. |
| Silent refresh | Axios response interceptor with single-flight promise. |
| Cache reset on logout | Dispatch RTK Query's `resetApiState` (or equivalent) to drop all cached server data — prevents the previous user's data from leaking into a new session. |
| Bootstrap on app mount | One refresh call on startup to restore the in-memory access token from the refresh cookie. |

The store and slices know nothing about transport — they assume the interceptor has already authenticated the request.

---

## 8. Error Handling

- One `ApiError` type used everywhere. Shape: status, app-level error code, user-safe message, optional details.
- Every interceptor failure path produces an `ApiError`. Every RTK Query hook surfaces it via `error`.
- Components branch on `error.code` (stable contract), never on `error.status`.
- A small global middleware listens for unexpected errors (e.g., 5xx) and triggers a toast — feature-specific errors are handled in the feature's UI.

---

## 9. Framework Notes

### 9.1 SSR (Next.js App Router)
- **Server components** fetch directly with the framework's `fetch` and use the framework's revalidation primitives. They never touch Redux.
- **Client components** use RTK Query for interactive data, mutations, and anything user-specific.
- Server-rendered HTML is sufficient for first paint; client-side hydration takes over for interactivity.
- The Redux provider is mounted inside a top-level client component; the root layout itself stays a server component.
- Auth bootstrap (the one-shot refresh call) runs in a client effect at mount.

### 9.2 SPA (Vite / Create React App)
- No SSR concerns. Provider wraps the app at the entry point.
- All data through RTK Query.
- For admin-style apps with live data needs, opt into polling per-endpoint rather than globally.

---

## 10. Conventions

| Concern | Convention |
|---|---|
| File names | `<feature>.api`, `<feature>.slice`, `<feature>.hooks`, `<feature>.types` |
| Endpoint names | `list<X>`, `get<X>`, `create<X>`, `update<X>`, `delete<X>`, `<verb><X>` for actions |
| Tag types | PascalCase, singular (`Cart`, `Order`) |
| Hook exports | Re-export under domain names (`useGetCartQuery → useCart`) |
| Selectors | Memoize derived data; never compute in components |
| Polling | Per-endpoint only, when justified (e.g., live order status). Not the default. |
| Mutations | Always declare `invalidatesTags`. Never call `refetch` manually after a mutation. |
| Components | No `useEffect` for fetching. No direct `dispatch`. Hooks only. |
| Imports | Components import only from `<feature>.hooks`. Nothing else from the feature is reachable. |
| Server data placement | Always in the RTK Query cache. Never in a `createSlice`. |
| Multiple axios instances | Forbidden. One instance, one set of interceptors. |
| Storage of tokens | In-memory only for access tokens. `httpOnly` cookie for refresh tokens. |

---

## 11. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Fetching in `useEffect` | Bypasses cache, deduplication, refetch logic. Indicates a missing hook. |
| Storing access tokens in `localStorage` | XSS can read them; any third-party script becomes a credential thief. |
| Putting server data in a `createSlice` | Two sources of truth → guaranteed drift. |
| Calling `refetch()` after a mutation | Tag invalidation already does this. Manual calls hide cache rules. |
| Creating a second axios instance | Splits the interceptor stack. Auth/refresh stops working consistently. |
| Components importing from `<feature>.api` directly | Breaks the indirection layer; refactors become invasive. |
| Mocking RTK Query hooks in tests | Real plumbing is bypassed. Mock the network instead. |
| Polling everywhere "to stay fresh" | Wastes bandwidth and server CPU. Use tag invalidation; poll only where business requires it. |
| Keeping payment/PII in `localStorage` for "convenience" | Regulatory and security risk. Client state only, cleared on session end. |

---

## 12. Testing Approach

| Layer | How to test |
|---|---|
| Reducers / client slices | Pure unit tests; dispatch actions, assert state. |
| Selectors | Pure unit tests, including memoization. |
| API slices | Integration tests with the network mocked at HTTP level (e.g., MSW). Assert that mutations invalidate the right queries. |
| Interceptors | Unit tests with a mocked axios adapter. **Specifically** test the single-flight refresh under concurrent 401s. |
| Components | Render with a real store + mocked network; assert behavior, not implementation. |
| Hooks | Render-hook tests with a real provider; same network mocking strategy. |

**Rule:** never mock the data layer (hooks/slices). Mock the network. The real plumbing must run in tests, because the bugs live in the plumbing.

---

## 13. Decision Summary

| Question | Answer |
|---|---|
| Server state container? | RTK Query cache |
| Client state container? | `createSlice`, only for non-server state |
| Transport? | Single axios instance with interceptors |
| Auth on requests? | Interceptor attaches access token from in-memory store |
| Token refresh? | Interceptor, single-flight promise, transparent retry |
| Cache invalidation? | Declarative tags on queries + mutations |
| Component data access? | Through feature hooks only |
| Effect-based fetching? | Forbidden |
| Multiple axios instances? | Forbidden |
| Where tokens live? | Access: memory. Refresh: `httpOnly` cookie. CSRF: readable cookie. |
| Cache on logout? | Reset entirely |
| SSR data? | Fetched in server components, not pushed through Redux |
