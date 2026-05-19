import type { S3Client } from "@aws-sdk/client-s3";
import { StormError, ErrorCodes, type UploadResponse } from "@storm/contracts";
import { uuidv7 } from "uuidv7";

import type { PrismaClient } from "../db.js";
import type { Config } from "../config.js";
import { presignPut } from "../infra/s3.js";

export interface UploadRequestInput {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes: number;
  altText?: string | undefined;
  uploadedBy: string;
}

export function uploadService(
  prisma: PrismaClient,
  s3: S3Client,
  config: Config,
) {
  async function requestUpload(input: UploadRequestInput): Promise<UploadResponse> {
    const mediaId = uuidv7();
    const ext = extFor(input.contentType);
    const s3Key = `original/${mediaId}.${ext}`;
    await prisma.mediaAsset.create({
      data: {
        id: mediaId,
        s3Key,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        altText: input.altText ?? null,
        status: "pending",
        uploadedBy: input.uploadedBy,
      },
    });
    const uploadUrl = await presignPut(s3, config, {
      key: s3Key,
      contentType: input.contentType,
      contentLength: input.sizeBytes,
    });
    const expiresAt = new Date(Date.now() + config.uploadUrlTtlSeconds * 1000);
    return { mediaId, uploadUrl, expiresAt: expiresAt.toISOString() };
  }

  async function confirmUpload(mediaId: string): Promise<void> {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
    if (!asset) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Media asset not found.",
        status: 404,
      });
    }
    if (asset.status === "ready") return;
    if (asset.status === "pending") {
      await prisma.mediaAsset.update({
        where: { id: mediaId },
        data: { status: "confirmed", confirmedAt: new Date() },
      });
    }
  }

  return { requestUpload, confirmUpload };
}

function extFor(contentType: string): string {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "bin";
}
