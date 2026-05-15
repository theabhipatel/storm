# Day 2 — Authentication, Notifications, API Gateway

**Goal:** End-to-end auth working: signup → verify → login → authenticated calls → logout. All auth-related emails + SMS delivered. Kong gateway live with JWT validation.

**Depends on:** Day 1.

---

## Backend — identity-service

### Prisma schema
- `users` — id (UUID v7), email (unique), passwordHash, name, mobile, mobileVerified, emailVerified, role (enum: customer | admin), blocked, tokenVersion (int), createdAt, updatedAt, deletedAt (nullable for soft-delete on Day 3)
- `oauth_accounts` — id, userId, provider (`google`), providerUserId, linkedAt; unique(provider, providerUserId)
- `audit_log` — id, actorId, subjectId, action (string), metadata (jsonb), createdAt
- `outbox` — id, aggregateId, eventType, payload (jsonb), createdAt, publishedAt (nullable)

### Redis keys (per `docs/authentication.md` §9)
- `session:<sid>`, `refresh:<jti>`, `user:<id>:tokenVersion`, `user:<id>:sessions` (set), `pwreset:<jti>`, `emailverify:<jti>`, `oauth:<state>`, `otp:<phone>`, rate-limit counters, `lockout:<userId>`, `newdevice:<userId>` (set of device fingerprints)

### Endpoints
| Method | Path | Notes |
|---|---|---|
| POST | /signup | Validates with Zod: email + password (≥12 chars) + name. HIBP k-anonymity check. Argon2id hash. Email-verification token via event. |
| POST | /verify-email | Confirms token; sets `emailVerified=true`. |
| POST | /login | Returns access JWT + sets refresh + CSRF cookies. Rate-limited. Account lockout after 5 fails (exponential backoff). Detects new device; emits event for new-device email. |
| POST | /refresh | Rotates tokens. Rejects reused refresh; revokes all sessions on reuse detection. |
| POST | /logout | Deletes session + refresh; clears cookies. |
| POST | /logout-all | Increments tokenVersion; deletes all sessions. |
| POST | /password-reset | Generic 204 even if email unknown (anti-enumeration). |
| POST | /password-reset/confirm | Confirms token + new password. Bumps tokenVersion. |
| POST | /password-change | Requires current password. Bumps tokenVersion. |
| POST | /mobile/send-otp | Generates 6-digit OTP, stores hashed in Redis (5 min TTL, 3 attempts). Emits event for SMS. |
| POST | /mobile/verify-otp | Verifies; sets `mobileVerified=true`. |
| GET | /google | OAuth start with PKCE + state in Redis (5 min). |
| GET | /google/callback | Exchanges code, verifies ID token, links/creates user. |
| GET | /me | Returns current user. |
| GET | /.well-known/jwks.json | Public keys for Kong. |

### Crypto / tokens
- JWT signed RS256, private key loaded from env (local) — Secrets Manager later
- JWKS with `kid` for rotation
- Access TTL: 15 min; refresh TTL: 7 days (sliding); CSRF TTL: matches refresh
- Refresh: opaque 32-byte random, SHA-256 hashed in Redis
- Single-use refresh rotation with reuse detection

### Cookies (per `docs/authentication.md` §2)
- `refresh_token`: HttpOnly, Secure, SameSite=Strict, Path=/api/auth, Max-Age=604800
- `csrf_token`: Secure, SameSite=Strict, Path=/, Max-Age=604800 (JS-readable)

### Outbox events
- `User.Created.v1`, `User.Blocked.v1` (Day 3), `User.Unblocked.v1` (Day 3)
- `User.PasswordChanged.v1`
- `User.OtpRequested.v1`
- `User.EmailVerificationRequested.v1`
- `User.PasswordResetRequested.v1`
- `User.NewDeviceLogin.v1`

### Account lockout flow
- 5 consecutive failed logins → temporary lock with exponential backoff (1m, 5m, 15m, 1h, 4h)
- Lockout marker in Redis with TTL
- Successful login resets counter

---

## Backend — notification-service

### MongoDB schema
- `notification_logs` — id, userId, channel (email|sms), templateId, templateVersion, payload (object), status (queued|sent|failed), providerResponse, attempts, sentAt, eventId
- `templates` — id, channel, locale, subject, htmlBody, smsBody, version, createdAt

### Templates seeded (HTML + plain text + SMS)
| Template ID | Channel | Trigger event |
|---|---|---|
| `welcome` | email | User.Created.v1 |
| `email-verification` | email | User.EmailVerificationRequested.v1 |
| `password-reset` | email | User.PasswordResetRequested.v1 |
| `password-changed` | email | User.PasswordChanged.v1 |
| `new-device-login` | email | User.NewDeviceLogin.v1 |
| `otp` | sms | User.OtpRequested.v1 |
| `account-blocked` | email | User.Blocked.v1 (Day 3) |

### Behavior
- Kafka consumer per event type
- Dedup by `eventId` in `processed_events` collection
- Provider integration: AWS SES (real for dev/prod), Mailhog (local dev). Twilio for SMS (test creds).
- Retry policy: 3 attempts with exponential backoff (10s, 30s, 90s) → DLQ topic `notification.dlq`
- Admin endpoints (Day 9): `GET /admin/notifications`, `POST /admin/notifications/:id/retry`

---

## Kong API Gateway

### Deployment
- Run via docker-compose locally (Kong DB-less mode with declarative config)

### Plugins enabled
- `jwt-signer` (verifies against JWKS endpoint of identity-service; caches 1h)
- Pre-function Lua script: checks Redis for `user:<sub>:tokenVersion` with **local cache (30s TTL) + Redis pub-sub invalidation** per `docs/authentication.md` §7
- `rate-limiting-advanced`:
  - Login: 5/IP/15min, 10/email/h
  - Signup: 5/IP/h
  - OTP send: 3/email/h
  - Password reset: 3/email/h
  - Refresh: 60/IP/h
  - Default: 600/IP/min
- `cors` (allowlist: customer + admin app origins; credentials true on /auth/*)
- `correlation-id` — generates `X-Request-Id` if absent
- `request-transformer` — strips `Authorization` after JWT validation; injects `X-User-Id`, `X-User-Role`, `X-Session-Id`

### Routes
| Path prefix | Upstream |
|---|---|
| /api/auth/* | identity-service |
| /api/admin/* | admin-bff |
| /api/* | web-bff (default customer routes) |

---

## Admin bootstrap

- CLI script: `pnpm bootstrap-admin -- --email=<x> --password=<y> --name=<z>` (runs in identity-service workspace)
- Creates a user with `role=admin`, `emailVerified=true`, `mobileVerified=false`
- Idempotent (no-op if email exists with admin role)
- Required for admin app login

---

## Frontend — `apps/web` (customer)

### Pages
- `/auth/signup` — form (name, email, password); on success → check email page
- `/auth/check-email` — instructs user to verify
- `/auth/verify-email?token=` — calls API; shows success or expired
- `/auth/login` — email + password + "Forgot password?" link + Google OAuth button
- `/auth/forgot-password` — email form
- `/auth/reset-password?token=` — new password form
- `/auth/login/google/callback` — OAuth landing
- `/account/change-password` (basic; full profile page on Day 3)

### Frontend infra
- `features/auth/` per `docs/frontend-state-management.md`: `auth.api.ts`, `auth.slice.ts`, `auth.hooks.ts`
- `lib/axios.ts` with auth + CSRF interceptors and silent-refresh singleton
- `lib/tokenStore.ts` — in-memory access token only
- `AuthBootstrap` client component runs `/refresh` on app mount
- All auth forms use React Hook Form + Zod

---

## Frontend — `apps/admin`

### Pages
- `/login` — email + password (admin role enforced server-side; show error if non-admin)
- `/forgot-password`, `/reset-password?token=`
- `/dashboard` — placeholder (full on Day 9), requires auth

---

## Execution Order
1. Prisma schema + migration for identity
2. identity-service endpoints (signup → login → refresh → logout)
3. JWT issuance + JWKS endpoint
4. Outbox + Kafka producer
5. Email verification + password reset + change password + mobile OTP
6. Google OAuth + new-device detection
7. notification-service consumers + SES + Twilio + templates
8. Kong configuration + JWT plugin + token-version Lua plugin + rate limits
9. Admin bootstrap CLI
10. apps/web auth pages + axios stack
11. apps/admin login

---

## Definition of Done

| Check |
|---|
| Signup creates user; welcome email lands in Mailhog |
| Email verification token works; account becomes verified |
| Login returns access token + sets cookies; new-device email lands on second device login |
| Authenticated request through Kong succeeds; raw JWT stripped; headers injected |
| Refresh rotates; reused refresh revokes all sessions |
| Logout deletes session; logout-all bumps tokenVersion |
| Bad login 5× triggers lockout with backoff |
| OTP send → SMS received (Twilio test); verify works |
| Google OAuth round-trip works (test app) |
| Password reset full cycle works |
| Admin bootstrap CLI creates first admin user |
| Both apps render authenticated state |
| Rate limit kicks in on /login after 5 attempts/15min |

---

## Out of scope today
- Profile management (Day 3)
- Address management (Day 3)
- Admin user list (Day 3)
- All other domain features (Days 4+)
