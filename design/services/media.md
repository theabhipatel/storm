# media-service

**Purpose:** Image upload pipeline. Issues presigned S3 URLs, tracks metadata, generates thumbnails, serves URLs through CloudFront.

## Storage
- Postgres: media_assets, thumbnails
- S3: actual files
- CloudFront: delivery

## Owned Entities

| Entity | Key fields |
|---|---|
| MediaAsset | id, s3Key, contentType, sizeBytes, width, height, status (pending/ready), uploadedBy, createdAt |
| Thumbnail | id, mediaAssetId, variant (sm/md/lg), s3Key, width, height |

## Key APIs

| Method | Path | Purpose |
|---|---|---|
| POST | /uploads | Request presigned upload URL → returns `{ uploadUrl, mediaId, expiresAt }` |
| POST | /uploads/:mediaId/confirm | Confirm upload finished |
| GET | /media/:id | Get CDN URL + thumbnails |

## Events Produced

| Event | When |
|---|---|
| Media.Uploaded.v1 | Asset uploaded and confirmed |
| Media.ProcessingComplete.v1 | Thumbnails generated |

## Events Consumed
None directly (thumbnail workers triggered by S3 → SQS, not Kafka).

## Dependencies
- AWS S3, CloudFront, SQS (for thumbnail worker queue)

## Notes
- Client uploads directly to S3 via presigned URL (no API CPU spent on bytes)
- S3 ObjectCreated event → SQS → media-service worker generates thumbnails (sm 200px, md 600px, lg 1200px)
- Catalog-service references `mediaId`; resolves to URL via media-service
- See [design/image-upload-pipeline.md](../image-upload-pipeline.md)
