# Day 3 — Profile, Addresses, Admin User Management

**Goal:** Customers manage their profile and addresses; admins manage users (list, search, block/unblock). All edges of account lifecycle covered.

**Depends on:** Day 2 (auth, identity-service running).

---

## Backend — identity-service (extensions)

### Prisma schema additions
- `addresses` — id, userId, label (string, e.g. "Home"), fullName, mobile, line1, line2, landmark, city, state, pincode (6 digits), country (default "IN"), isDefault (bool), createdAt, updatedAt, deletedAt
- `profile_changes` — id, userId, field (string), oldValue, newValue, changedAt (audit of profile mutations)

### Profile endpoints
| Method | Path | Notes |
|---|---|---|
| GET | /me | Returns full profile (user + default address summary) |
| PATCH | /me | Updates name only. Audit-logged. |
| POST | /me/email/change | New email + current password. Triggers verification email to new address; old email continues to work until confirmed. |
| POST | /me/email/change/confirm | Confirms token → email updated; bumps tokenVersion. |
| POST | /me/mobile/change | New mobile + current password. Sends OTP to new mobile. |
| POST | /me/mobile/change/confirm | Confirms OTP → mobile updated. |
| POST | /me/delete | Soft-delete: sets `deletedAt`, anonymizes PII (email → `deleted-<uuid>@storm.local`, name → "Deleted User", mobile → null). Bumps tokenVersion; revokes all sessions. Requires current password + explicit confirmation flag. |

### Address endpoints
| Method | Path | Notes |
|---|---|---|
| GET | /me/addresses | List user's addresses (deletedAt is null) |
| POST | /me/addresses | Create. Validates pincode (6 digits, starts 1–9), mobile (+91, 10 digits starting 6–9). Max 10 active addresses per user. |
| GET | /me/addresses/:id | Single address |
| PATCH | /me/addresses/:id | Update |
| DELETE | /me/addresses/:id | Soft-delete; reject if it's the only address and isDefault=true (require setting another default first) |
| POST | /me/addresses/:id/set-default | Atomically marks this address default and clears default on others |

### Validation rules (Zod schemas, exported to `packages/contracts/dto`)
- Pincode: `/^[1-9][0-9]{5}$/`
- Indian mobile: `/^[6-9][0-9]{9}$/` (stored without `+91`; UI prepends)
- Name: 1–100 chars, allow letters/spaces/.
- Address fields: line1 required (≥3 chars), line2 optional, city ≥2 chars, state from fixed list of Indian states + UTs

### Admin user endpoints (used by admin-bff on Day 9)
| Method | Path | Notes |
|---|---|---|
| GET | /admin/users | Paginated list with filters: query (email/name), role, blocked, createdAfter |
| GET | /admin/users/:id | Detail incl. addresses, recent audit log |
| POST | /admin/users/:id/block | Sets blocked=true; bumps tokenVersion; revokes refresh tokens; emits `User.Blocked.v1`; logs to audit |
| POST | /admin/users/:id/unblock | Sets blocked=false; emits `User.Unblocked.v1`; logs to audit. Does **not** decrement tokenVersion. |

### New outbox events
- `User.AddressAdded.v1`, `User.AddressUpdated.v1`, `User.AddressDeleted.v1` (for audit/analytics; no immediate consumer)
- `User.EmailChanged.v1`, `User.MobileChanged.v1`
- `User.Deleted.v1` (soft-delete trigger; consumed by notification-service → goodbye email before anonymization)

---

## Backend — notification-service (extensions)

New templates seeded:
| Template ID | Channel | Trigger |
|---|---|---|
| `email-changed` | email | User.EmailChanged.v1 (sent to old + new email) |
| `mobile-changed` | sms | User.MobileChanged.v1 |
| `account-deleted` | email | User.Deleted.v1 |
| `account-blocked` | email | User.Blocked.v1 |
| `account-unblocked` | email | User.Unblocked.v1 |

---

## Frontend — `apps/web` (customer)

### Pages
- `/account` — overview (name, email, mobile, default address, links to subpages)
- `/account/profile` — edit name, change email (form → check email), change mobile (form → enter OTP), change password
- `/account/addresses` — list with cards, "Add new", "Edit", "Delete", "Set default"
- `/account/addresses/new` — form
- `/account/addresses/:id/edit` — form
- `/account/delete` — confirmation flow with password + checkbox "I understand this is permanent"

### Components
- `AddressCard`, `AddressForm` (with Zod-driven validation, Indian state dropdown), `ConfirmDialog`, `OtpInput`

### Behaviors
- Email change: optimistic UI shows "verification sent"; old email functional until new verified
- Mobile change: same — old number stays until OTP confirmed
- Default address: setting one default automatically clears others (atomic on server)
- Cannot delete the last address (UI disables button + tooltip explains)

---

## Frontend — `apps/admin`

### Pages
- `/users` — paginated table (email, name, role, blocked, createdAt). Filters: search (email/name), role, blocked status. Click row → detail.
- `/users/:id` — detail panel (basic info, all addresses, recent audit log entries), actions: Block / Unblock (with confirm dialog + reason text)

### Components
- `DataTable` (sortable, paginated, server-driven)
- `UserDetailPanel`, `BlockUserDialog`

---

## Execution Order
1. Migration adds `addresses` + `profile_changes` tables
2. Profile + address endpoints in identity-service
3. Admin user endpoints
4. notification-service: new templates + consumers
5. apps/web profile + address pages
6. apps/admin user list + detail

---

## Definition of Done

| Check |
|---|
| User updates name; audit log entry created |
| Email change triggers verification email; old email works until new confirmed; tokenVersion bumped on confirm |
| Mobile change triggers OTP to new number; old mobile works until OTP confirmed |
| User creates, edits, deletes addresses; max-10 enforced; pincode + mobile validated |
| Setting an address as default atomically clears others |
| Last default address cannot be deleted; UI disables button |
| Account soft-delete anonymizes PII; sessions revoked; user redirected to login |
| Admin lists users with filters; blocked filter works |
| Admin blocks a user; blocked-account email lands; user denied within ~1s on next request |
| Admin unblocks; user must log in fresh |
| Audit log shows admin action |

---

## Out of scope today
- Catalog, search, cart (Day 4+)
- Order management (Day 8)
- Admin app dashboard tiles (Day 9)
