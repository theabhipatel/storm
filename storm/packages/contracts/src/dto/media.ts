import { z } from "zod";

export const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const MediaContentTypeSchema = z.enum(ALLOWED_MEDIA_TYPES);
export type MediaContentType = z.infer<typeof MediaContentTypeSchema>;

export const UploadRequestSchema = z.object({
  contentType: MediaContentTypeSchema,
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  altText: z.string().max(200).optional(),
});
export type UploadRequest = z.infer<typeof UploadRequestSchema>;

export const UploadResponseSchema = z.object({
  mediaId: z.string().uuid(),
  uploadUrl: z.string().url(),
  expiresAt: z.string().datetime(),
});
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

export const MediaStatusSchema = z.enum(["pending", "confirmed", "ready", "failed"]);
export type MediaStatusDto = z.infer<typeof MediaStatusSchema>;

export const MediaThumbnailSchema = z.object({
  variant: z.enum(["sm", "md", "lg"]),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  status: MediaStatusSchema,
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  altText: z.string().nullable(),
  original: z.string().url(),
  thumbnails: z.array(MediaThumbnailSchema),
  uploadedBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type MediaAssetDto = z.infer<typeof MediaAssetSchema>;
