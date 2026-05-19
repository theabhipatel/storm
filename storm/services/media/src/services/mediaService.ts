import { StormError, ErrorCodes, type MediaAssetDto } from "@storm/contracts";

import type { PrismaClient } from "../db.js";
import type { Config } from "../config.js";
import { publicUrlFor } from "../infra/s3.js";

export function mediaService(prisma: PrismaClient, config: Config) {
  async function get(mediaId: string): Promise<MediaAssetDto> {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: mediaId },
      include: { thumbnails: true },
    });
    if (!asset) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Media asset not found.",
        status: 404,
      });
    }
    return {
      id: asset.id,
      status: asset.status,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes,
      width: asset.width,
      height: asset.height,
      altText: asset.altText,
      original: publicUrlFor(config, asset.s3Key),
      uploadedBy: asset.uploadedBy,
      createdAt: asset.createdAt.toISOString(),
      thumbnails: asset.thumbnails.map((t) => ({
        variant: t.variant,
        url: publicUrlFor(config, t.s3Key),
        width: t.width,
        height: t.height,
      })),
    };
  }

  async function getMany(mediaIds: string[]): Promise<MediaAssetDto[]> {
    if (mediaIds.length === 0) return [];
    const assets = await prisma.mediaAsset.findMany({
      where: { id: { in: mediaIds } },
      include: { thumbnails: true },
    });
    // Preserve input order for deterministic responses.
    const byId = new Map(assets.map((a) => [a.id, a]));
    return mediaIds
      .map((id) => byId.get(id))
      .filter((a): a is NonNullable<typeof a> => !!a)
      .map((asset) => ({
        id: asset.id,
        status: asset.status,
        contentType: asset.contentType,
        sizeBytes: asset.sizeBytes,
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        original: publicUrlFor(config, asset.s3Key),
        uploadedBy: asset.uploadedBy,
        createdAt: asset.createdAt.toISOString(),
        thumbnails: asset.thumbnails.map((t) => ({
          variant: t.variant,
          url: publicUrlFor(config, t.s3Key),
          width: t.width,
          height: t.height,
        })),
      }));
  }

  async function updateAltText(mediaId: string, altText: string | null): Promise<MediaAssetDto> {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
    if (!asset) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Media asset not found.",
        status: 404,
      });
    }
    await prisma.mediaAsset.update({
      where: { id: mediaId },
      data: { altText: altText ?? null },
    });
    return get(mediaId);
  }

  return { get, getMany, updateAltText };
}
