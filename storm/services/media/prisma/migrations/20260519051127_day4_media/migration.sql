-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('pending', 'confirmed', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "ThumbnailVariant" AS ENUM ('sm', 'md', 'lg');

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "s3_key" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "status" "MediaStatus" NOT NULL DEFAULT 'pending',
    "uploaded_by" UUID NOT NULL,
    "alt_text" TEXT,
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "ready_at" TIMESTAMP(3),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thumbnails" (
    "id" UUID NOT NULL,
    "media_asset_id" UUID NOT NULL,
    "variant" "ThumbnailVariant" NOT NULL,
    "s3_key" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thumbnails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox" (
    "id" UUID NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_s3_key_key" ON "media_assets"("s3_key");

-- CreateIndex
CREATE INDEX "media_assets_status_updated_at_idx" ON "media_assets"("status", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "thumbnails_media_asset_id_variant_key" ON "thumbnails"("media_asset_id", "variant");

-- CreateIndex
CREATE INDEX "outbox_published_at_created_at_idx" ON "outbox"("published_at", "created_at");

-- AddForeignKey
ALTER TABLE "thumbnails" ADD CONSTRAINT "thumbnails_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
