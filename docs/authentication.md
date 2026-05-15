# Authentication Architecture

**Applies to:** Any web SPA + REST/GraphQL backend fronted by an API gateway. Server-issued tokens, JS-resistant storage, defense-in-depth against common web auth attacks.

---

## 1. Goals

- Industry-standard auth model aligned with OWASP guidance
- Defenses against XSS, CSRF, token theft, brute force, credential stuffing, MITM, session fixation
- Stateless verification at the gateway — no datastore hop per request
- Real-time user revocation — next request denied after admin action
- Per-session and "logout everywhere" revocation
- Easily extended for OAuth identity providers
- One contract for both first-party SPAs and (later) native mobile

---

## 2. Core Token Model — Three Tokens

| Token | Format | Purpose | Lifetime | Client storage | Server storage |
|---|---|---|---|---|---|
| **Access** | Signed JWT, asymmetric | Identity + role on every API call | Short (minutes) | JavaScript memory | None (stateless verification) |
| **Refresh** | Opaque random | Right to mint new access tokens | Long (days), sliding | `httpOnly` + `Secure` + `SameSite=Strict` cookie | Hashed in fast KV store |
| **CSRF** | Opaque random | Same-origin proof on cookie endpoints | Matches refresh | Non-`httpOnly` cookie (JS-readable) | Mirrored alongside refresh record |

**Rationale for each storage choice:**

| Choice | Reason |
|---|---|
| Access in JS memory | XSS cannot persist or read it after a refresh; short TTL limits exposure |
| Refresh in `httpOnly` cookie | JS cannot read → XSS-safe; long-lived without becoming an XSS prize |
| CSRF in readable cookie | Frontend must echo it back as a header for double-submit pattern |
| Forbidden: `localStorage` / `sessionStorage` | Any XSS = full account takeover |

---

## 3. Token Signing & Issuance

| Concern | Standard |
|---|---|
| Algorithm | Asymmetric (RS256 or ES256). Never symmetric (HS256) in distributed systems. |
| Key holder | Identity service only holds the private key |
| Public key distribution | JWKS endpoint, cached by the gateway |
| Key rotation | Annual minimum; advertise multiple keys during the rotation window via `kid` header |
| Access token claims | Subject (userId), role, session ID, **token version**, issued-at, expiry |
| Refresh token format | Opaque only (must be revocable — JWTs are not) |
| Refresh rotation | **Single-use**: every refresh issues a new refresh token and invalidates the old |
| Reuse detection | A previously rotated refresh token presented again → treat as theft → revoke all sessions for that user |

---

## 4. Cookie Configuration

| Flag | Refresh cookie | CSRF cookie | Why |
|---|---|---|---|
| `HttpOnly` | Yes | No | Refresh hidden from JS; CSRF must be readable by JS to echo back |
| `Secure` | Yes | Yes | HTTPS only |
| `SameSite=Strict` | Yes | Yes | Primary CSRF defense — browser refuses cross-site sending |
| `Path` | Scoped to auth endpoints | Root | Refresh never leaks to non-auth requests |
| `Domain` | Unset (host-only) | Unset (host-only) | Prevent subdomain leakage |

---

## 5. CSRF Protection — Double-Submit Token

Applied to **cookie-bearing endpoints only** (refresh, logout, logout-all).

| Step | Action |
|---|---|
| 1 | Server sets refresh (`httpOnly`) and CSRF (readable) cookies on login/refresh |
| 2 | Frontend reads CSRF cookie value |
| 3 | Frontend attaches it as a request header on cookie-bearing requests |
| 4 | Server requires header value == cookie value (constant-time compare) |
| 5 | Cross-origin attacker cannot read the cookie → cannot forge the header → CSRF blocked |

**Bearer-token endpoints don't need a CSRF token.** A custom `Authorization` header cannot be set by cross-origin code without a CORS preflight, which the server denies.

---

## 6. Auth Flows (Conceptual)

### 6.1 Signup
- Validate password strength + breach-list check (e.g., HIBP k-anonymity)
- Hash with a modern KDF (Argon2id preferred; bcrypt acceptable)
- Persist user with `email_verified = false`, `blocked = false`
- Send a single-use verification token via email
- No auto-login until email is verified

### 6.2 Login
- Rate-limited at the gateway (per IP, per email)
- Reject blocked users
- Verify credentials with constant-time comparison
- Apply per-account exponential backoff after consecutive failures
- Generate a new session ID server-side (never accept client-supplied)
- Mint access JWT with current token version + new refresh + new CSRF token
- Return access in response body; refresh + CSRF as cookies

### 6.3 Authenticated request
Performed by the gateway:
1. Verify JWT signature against cached JWKS
2. Verify expiry
3. Verify JWT's token version equals the user's current token version (KV lookup)
4. On success → strip the token, inject identity headers to upstream services
5. On failure → 401

Downstream services trust gateway-injected headers. They do **not** re-verify the token.

### 6.4 Refresh
- CSRF check
- Look up refresh token (hashed) in KV store
- Reject if already rotated (theft) → revoke all sessions for the user
- Reject if expired or user is blocked
- Mint new access + new refresh + new CSRF; invalidate old refresh
- Return new access in body, new cookies on response

### 6.5 Logout
- CSRF check
- Delete session and refresh records server-side
- Clear cookies

### 6.6 Logout-all
- Increment user's token version → every outstanding access JWT becomes invalid immediately
- Delete all refresh records for the user

### 6.7 Password reset
- Single-use token sent via email, short TTL, hashed server-side
- On confirmation: update hash, increment token version, revoke all refresh tokens

### 6.8 Password change (logged in)
- Requires current password
- Update hash, increment token version, revoke all refresh tokens, issue fresh tokens for current session

### 6.9 OAuth (provider identity)
- OAuth 2.0 Authorization Code + **PKCE always** — even when a server-held client secret exists
- Validate provider state + ID token; extract verified email
- Link or create user
- From here, identical to local login: mint our access + refresh + CSRF tokens
- Provider tokens are never exposed to the frontend

---

## 7. Real-Time User Revocation — Token Version

Mechanism: a per-user integer counter in the fast KV store. Every JWT carries the user's token version at issuance. The gateway compares per request.

| Property | Detail |
|---|---|
| Storage | KV store (Redis or equivalent), one key per user |
| Gateway check | Local in-process cache (per-user, ~30s TTL) backed by KV; refreshed on miss |
| Invalidation propagation | KV publish/subscribe channel — gateway nodes drop local cache entries on increment, so updates are pushed, not polled |
| Check cost | Cache hit ~sub-ms (zero network); cache miss ~1 KV lookup |
| Mass-invalidation | Increment the counter → all outstanding access tokens invalidated within the cache TTL (worst case 30 s) and immediately on cache-aware gateway nodes |
| Effect on refresh | Refresh tokens are deleted alongside, so the user cannot recover access |

### When to increment

| Action | Why |
|---|---|
| Admin blocks the user | Immediate access termination |
| User changes password | Force re-auth on all devices |
| Password reset confirmed | Same |
| "Logout everywhere" | Same |
| Suspected token theft (refresh reuse) | Cut off the attacker |
| Role change (demotion or revocation) | Reflect new permissions immediately |

**Unblock does not decrement.** The user must log in fresh — preventing accidental reactivation of an attacker's previously stolen tokens.

---

## 8. Password Handling

| Concern | Standard |
|---|---|
| Algorithm | Argon2id (preferred) or bcrypt (minimum) |
| Storage format | Self-describing (algorithm + parameters embedded), so parameters can be tuned over time |
| Tuning target | ~250 ms hash time on production hardware |
| Policy | NIST SP 800-63B: minimum length (≥ 12), no maximum cap, no composition rules |
| Breach check | HIBP k-anonymity at signup and password change |
| Comparison | Constant-time |
| Logging | Never logged, never returned, never echoed in error messages |
| Reset token | Single-use, short TTL, hashed server-side |

---

## 9. Security Headers

Required on every response:

| Header | Purpose |
|---|---|
| `Strict-Transport-Security` | Force HTTPS for the domain (HSTS, preload-eligible) |
| `Content-Security-Policy` | Constrain executable scripts → primary XSS mitigation |
| `X-Content-Type-Options: nosniff` | Prevent MIME confusion |
| `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'` | Prevent clickjacking |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | Disable unused browser features (camera, mic, geolocation) |
| `Cross-Origin-Opener-Policy: same-origin` | Process isolation |
| `Cross-Origin-Resource-Policy: same-site` | Resource access boundary |

**CSP rules:** no `unsafe-inline`, no `unsafe-eval`, nonces for any required inline scripts, strict allowlists for `script-src` / `connect-src` / `img-src`.

**CORS rules:** restrictive allowlist (specific origins, no wildcards). `Access-Control-Allow-Credentials: true` only on auth-cookie endpoints.

---

## 10. Server-Side State (Conceptual)

Logical records held in the fast KV store:

| Record | Holds | Lifetime |
|---|---|---|
| Session | userId, session ID, device metadata, IP | Refresh TTL |
| Refresh | userId, session ID, hashed token, CSRF token, expiry | Refresh TTL |
| Token version counter | Per-user integer; bumped to invalidate all access tokens | Permanent |
| User session index | Set of session IDs per user — used for "logout all" / block | Permanent |
| Password reset | userId, hashed token | Short (~30 min) |
| Email verification | userId, hashed token | Medium (~24 h) |
| OAuth flow state | PKCE verifier, redirect target | Very short (~5 min) |
| Rate-limit counters | Per-IP, per-email login attempts | Short (15 min – 1 h) |
| Lockout marker | Per-user after consecutive failures | Dynamic backoff |

**Hashing rule:** any token persisted server-side (refresh, reset, verification) is stored as a SHA-256 hash, never in plaintext.

---

## 11. Gateway Responsibilities

The API gateway centralizes per-request enforcement so backend services don't:

- Verify JWT signature (using cached JWKS public key)
- Verify expiry
- Verify token version against the live KV value
- Apply rate limits (per IP, per user, per route)
- Reject on failure with consistent 401/403

**On success:** strip the raw token from the request and inject identity headers (user ID, role, session ID) for upstream services. Services treat these headers as authoritative.

**Why this matters:** verification logic exists in exactly one place, eliminating inconsistent enforcement and reducing per-service complexity.

---

## 12. Threat → Defense Map

| Threat | Defense |
|---|---|
| XSS reading tokens | Access token in JS memory only; refresh in `httpOnly` cookie; strict CSP; no inline scripts |
| CSRF on cookie endpoints | `SameSite=Strict` (primary); double-submit CSRF token (defense in depth); CORS preflight denial |
| CSRF on bearer endpoints | Custom `Authorization` header — cross-origin code cannot set it without CORS approval |
| Refresh token theft | Single-use rotation + reuse detection → all sessions revoked |
| Access token theft | Short TTL limits exposure; token version mass-invalidation available |
| Brute force / credential stuffing | Gateway rate limits; per-account exponential lockout; HIBP check; CAPTCHA after suspicion |
| MITM | TLS 1.2+; HSTS preload; `Secure` cookie flag |
| Session fixation | Server-generated session ID on every login; never accept client-supplied |
| Account enumeration | Generic responses on signup, login, password reset |
| Subdomain cookie leak | Host-only cookies (`Domain` unset); strict `Path` scoping |
| Stale privileges after demotion/block | Token version bump enforced at gateway within one request |
| Replay across devices | Session ID per device; user can list and revoke individual sessions |

---

## 13. Conventions

| Concern | Convention |
|---|---|
| Token signing | Asymmetric (RS256 / ES256) |
| Access token format | JWT |
| Refresh token format | Opaque |
| Refresh strategy | Single-use rotation |
| Per-request validation | Gateway only |
| Service-to-service trust | Headers injected by gateway |
| Server-side token storage | Hashed (SHA-256), never plaintext |
| Secret comparisons | Constant-time |
| OAuth flow | Authorization Code + PKCE (always) |
| Email verification | Required before sensitive actions (purchases, payments) |
| Logging | Never log tokens, passwords, OTPs — only user IDs, session IDs, action codes |
| Audit log | Append-only; admin actions, blocks, password changes, "logout all" |
| Mobile native (when added) | Same access/refresh model; refresh stored in OS secure storage; no cookies, no CSRF |

---

## 14. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Tokens in `localStorage` / `sessionStorage` | XSS = full account takeover |
| JWT-based refresh tokens | Cannot be revoked without a blacklist; opaque tokens are revocable by design |
| Long-lived access tokens | Stolen token usable for hours or days |
| Symmetric JWT signing (HS256) across services | Every service holds the signing key; one compromise = system compromise |
| Implicit OAuth flow | Deprecated; tokens exposed in URL fragments. Always use Code + PKCE |
| Storing bearer tokens in cookies | Combines worst of both — cookie-attached and CSRF-prone |
| Re-verifying JWT in every service | Wasted compute, inconsistent enforcement, duplicated bugs |
| Logging tokens, passwords, OTPs | Log files become credential dumps |
| Skipping CSRF on cookie-bearing endpoints | `SameSite` is primary but not universal — defense in depth required |
| Account-enumeration responses | Enables targeted phishing |
| Decrementing token version on unblock | Reactivates the attacker's previously stolen tokens |
| Mixing identity and authorization in one service while letting services decide both | Authorization decisions drift between services; centralize at gateway / policy layer |

---

## 15. Decision Summary

| Question | Answer |
|---|---|
| Access token format? | JWT, asymmetrically signed |
| Access token storage? | JS memory only |
| Refresh token format? | Opaque random |
| Refresh token storage (client)? | `httpOnly` + `Secure` + `SameSite=Strict` cookie, scoped path |
| Refresh token storage (server)? | Hashed in fast KV store |
| Refresh rotation? | Single-use with reuse detection |
| CSRF protection? | Double-submit token on cookie endpoints; bearer header for the rest |
| Mass invalidation? | Per-user token version counter |
| Real-time block propagation? | One round-trip (~next request) |
| Password hashing? | Argon2id |
| OAuth flow? | Authorization Code + PKCE, always |
| Per-request validation? | Gateway only |
| Service-to-service trust? | Headers injected by gateway |
| Token / password logging? | Never |
| Cache reset on logout? | All client-side caches wiped |
