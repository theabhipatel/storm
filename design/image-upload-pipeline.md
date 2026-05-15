# Image Upload Pipeline

**Scope:** How product (and any) images flow from the admin app to S3, get thumbnails, and become CDN-delivered URLs attached to catalog entries.

---

## 1. Flow

```
Admin app ── presigned URL ──→ media-service
   │
   │ direct PUT to S3
   ▼
   S3 ── ObjectCreated ──→ SQS ──→ media-service worker ──→ thumbnails to S3
   │                                          │
   │                                          ▼
   │                              Media.ProcessingComplete event
   ▼
Admin app polls / receives → attaches mediaId to product
   │
   ▼
catalog-service stores ProductMedia(productId, mediaId)
```

Bytes never traverse the API.

---

## 2. Step-by-Step

| Step | Actor | Action |
|---|---|---|
| 1 | Admin UI | Selects image; computes contentType + size |
| 2 | Admin UI → admin-bff → media-service | `POST /uploads` with `{ contentType, size }` |
| 3 | media-service | Validates contentType + size (max 10MB); creates `MediaAsset` row, status `pending`; generates presigned PUT URL (5 min expiry); returns `{ uploadUrl, mediaId }` |
| 4 | Admin UI | `PUT` file directly to S3 using the URL |
| 5 | S3 | Stores object; fires ObjectCreated to SQS |
| 6 | media-service thumbnail worker | Polls SQS; downloads original; generates `sm` (200px), `md` (600px), `lg` (1200px) WebP variants; uploads to S3 |
| 7 | media-service | Updates `MediaAsset` status to `ready`; persists `Thumbnail` rows; emits `Media.ProcessingComplete.v1` event |
| 8 | Admin UI | Polls `GET /media/:id` (or receives notification) — gets full URL set |
| 9 | Admin UI → catalog-service | Calls `POST /admin/products/:id/media` with `mediaId` |
| 10 | catalog-service | Persists `ProductMedia(productId, mediaId, order)`; emits `Product.Updated` |

---

## 3. URLs & Delivery

| URL pattern | Purpose |
|---|---|
| `cdn.storm.example/media/<mediaId>/original.webp` | Original, served via CloudFront |
| `cdn.storm.example/media/<mediaId>/sm.webp` | 200px thumbnail |
| `cdn.storm.example/media/<mediaId>/md.webp` | 600px |
| `cdn.storm.example/media/<mediaId>/lg.webp` | 1200px |

CloudFront origin is S3 with signed-URL access (private bucket). Cache TTL: 30 days.

---

## 4. Validation & Security

| Concern | Mechanism |
|---|---|
| File type | Presigned URL restricts `Content-Type`; server re-checks after upload |
| Size limit | Presigned URL specifies `Content-Length` range |
| Malicious content | Re-scan via worker (image dimensions check + format validation); reject obviously malformed |
| Auth | Presigned URL request requires admin JWT |
| URL expiry | 5 min — caller must upload promptly |
| S3 bucket access | Private; only CloudFront via OAC + media-service can read |

---

## 5. Failure Handling

| Failure | Handling |
|---|---|
| Upload fails / never confirmed | `MediaAsset` stays `pending`; cron sweeps and deletes pending older than 1h + S3 objects |
| Thumbnail generation fails | Retry from SQS (3 attempts); DLQ after; admin sees `ready: false` and can retry |
| S3 ObjectCreated event lost | Daily reconciliation: S3 list vs DB `MediaAsset` rows; trigger thumbnails for orphans |
| Worker crashes mid-thumbnail | SQS visibility timeout returns the message; another worker picks up |

---

## 6. Catalog Reference

`Product.media: [{ mediaId, order }]` — catalog stores only IDs.
Web-bff resolves IDs to URLs via media-service when composing product detail responses (cached 5 min).

---

## 7. Lifecycle

| Stage | What happens |
|---|---|
| Upload | Original goes to `s3://media/original/<mediaId>` |
| Processing | Thumbnails to `s3://media/thumbs/<mediaId>/{sm,md,lg}.webp` |
| Deletion | Soft-delete `MediaAsset`; lifecycle rule removes S3 objects after 30 days |
| Unused | Background job flags `MediaAsset`s with no `ProductMedia` references; auto-delete after 7 days |
