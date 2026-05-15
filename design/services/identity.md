# identity-service

**Purpose:** User identity, authentication, sessions, JWT issuance, RBAC, mobile verification.

## Storage
- Postgres (primary): users, oauth_accounts, audit_log
- Redis: sessions, refresh tokens, token version, OTPs, rate-limit counters, pwreset/email-verify records

## Owned Entities

| Entity | Key fields |
|---|---|
| User | id, email, passwordHash, name, mobile, mobileVerified, emailVerified, role, blocked, tokenVersion |
| OAuthAccount | id, userId, provider, providerUserId |
| AuditLog | id, actorId, subjectId, action, metadata, createdAt |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| POST | /signup | Email+password signup |
| POST | /login | Email+password login |
| POST | /refresh | Rotate access token (cookie+CSRF) |
| POST | /logout | End session |
| POST | /logout-all | Invalidate all sessions |
| POST | /verify-email | Confirm verification token |
| POST | /password-reset | Request reset email |
| POST | /password-reset/confirm | Set new password |
| POST | /password-change | Change current password |
| GET | /google | Start OAuth |
| GET | /google/callback | OAuth callback |
| POST | /mobile/send-otp | Send OTP via Twilio |
| POST | /mobile/verify-otp | Confirm OTP |
| GET | /me | Current user |
| POST | /admin/users/:id/block | Block user (admin) |
| POST | /admin/users/:id/unblock | Unblock user (admin) |
| GET | /.well-known/jwks.json | Public keys for Kong |

## Events Produced

| Event | When |
|---|---|
| User.Created.v1 | New signup confirmed |
| User.Blocked.v1 | Admin blocks user |
| User.Unblocked.v1 | Admin unblocks user |
| User.PasswordChanged.v1 | Password updated |

## Events Consumed
None.

## Dependencies
- Twilio (SMS OTP)
- AWS SES (email — via notification-service in practice)
- Google OAuth

## References
- [docs/authentication.md](../../docs/authentication.md) — full auth model
