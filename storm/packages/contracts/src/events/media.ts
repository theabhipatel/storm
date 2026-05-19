import { z } from "zod";

export const MediaEventTypes = {
  MediaProcessingComplete: "Media.ProcessingComplete.v1",
  MediaProcessingFailed: "Media.ProcessingFailed.v1",
} as const;

export type MediaEventType = (typeof MediaEventTypes)[keyof typeof MediaEventTypes];

export const ThumbnailVariantEnum = z.enum(["sm", "md", "lg"]);
export type ThumbnailVariant = z.infer<typeof ThumbnailVariantEnum>;

export const MediaProcessingCompletePayload = z.object({
  mediaId: z.string().uuid(),
  contentType: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  variants: z.array(
    z.object({
      variant: ThumbnailVariantEnum,
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
  ),
});

export const MediaProcessingFailedPayload = z.object({
  mediaId: z.string().uuid(),
  reason: z.string(),
});

export type MediaProcessingComplete = z.infer<typeof MediaProcessingCompletePayload>;
export type MediaProcessingFailed = z.infer<typeof MediaProcessingFailedPayload>;
