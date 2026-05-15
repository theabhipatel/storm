# notification-service

**Purpose:** Send transactional email (SES) and SMS (Twilio) in response to domain events. Template-driven, retry-safe.

## Storage
- MongoDB (logs): notification_logs (one doc per send attempt with status, provider response, retries)
- Redis: rate limits, dedup

## Owned Entities

| Entity | Key fields |
|---|---|
| NotificationLog | id, userId, channel (email/sms), templateId, payload, status, providerResponse, attempts, sentAt |
| Template | id, channel, locale, subject, body (versioned) |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| GET | /admin/notifications | Admin view of recent sends + failures |
| POST | /admin/notifications/:id/retry | Manual retry |

Notifications are not sent via REST — only via event consumption.

## Events Produced
None.

## Events Consumed

| Event | Sends |
|---|---|
| User.Created.v1 | Welcome email |
| User.PasswordChanged.v1 | Notification email |
| Order.Confirmed.v1 | Order confirmation email + SMS |
| Order.StatusChanged.v1 | Status update email/SMS |
| Order.Failed.v1 | Payment failure notification |
| Order.Cancelled.v1 | Cancellation email |
| (OTP triggers, dispatched directly from identity-service via internal RPC) | OTP SMS |

## Dependencies
- AWS SES (email)
- Twilio (SMS, DLT-compliant templates for India)

## Notes
- Each event consumer deduplicates by `eventId` + `templateId` (so a re-emitted event doesn't double-send)
- Failures retry with exponential backoff (3 attempts) → DLQ topic on persistent failure
- Templates versioned; admin can preview and adjust
