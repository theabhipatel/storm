import axios from "axios";

import { catalogMediaApi } from "../../store/apiSlice";
import { MEDIA_BASE_URL, mediaClient } from "../../lib/serviceApi";

export interface MediaThumbnail {
  variant: "sm" | "md" | "lg";
  url: string;
  width: number;
  height: number;
}

export interface MediaAssetDto {
  id: string;
  status: "pending" | "confirmed" | "ready" | "failed";
  contentType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  original: string;
  thumbnails: MediaThumbnail[];
  uploadedBy: string;
  createdAt: string;
}

export interface UploadResponse {
  mediaId: string;
  uploadUrl: string;
  expiresAt: string;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    getMedia: build.query<MediaAssetDto, string>({
      query: (id) => ({ client: "media", url: `/api/media/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Media", id }],
    }),
    getMediaBatch: build.query<{ items: MediaAssetDto[] }, string[]>({
      query: (ids) => ({
        client: "media",
        url: "/api/media",
        params: { ids: ids.join(",") },
      }),
      providesTags: (res) =>
        res
          ? res.items.map((m) => ({ type: "Media" as const, id: m.id }))
          : [],
    }),
    updateMediaAlt: build.mutation<
      MediaAssetDto,
      { id: string; altText: string | null }
    >({
      query: ({ id, altText }) => ({
        client: "media",
        url: `/api/media/${id}`,
        method: "PATCH",
        data: { altText },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Media", id }],
    }),
  }),
});

export const {
  useGetMediaQuery,
  useGetMediaBatchQuery,
  useUpdateMediaAltMutation,
} = api;

// File upload is a 3-step flow that can't be expressed as a single RTK Query
// mutation cleanly (we need the presigned URL between steps), so we expose
// a plain helper. Re-fetch the media asset from `useGetMediaQuery` to observe
// thumbnail processing.
export async function uploadImageFile(args: {
  file: File;
  altText?: string;
  onProgress?: (pct: number) => void;
}): Promise<UploadResponse> {
  const { file, altText, onProgress } = args;
  if (!isAllowedType(file.type)) {
    throw new Error("Only JPEG, PNG, or WebP images are accepted.");
  }
  const presign = await mediaClient.post<UploadResponse>("/api/uploads", {
    contentType: file.type,
    sizeBytes: file.size,
    ...(altText ? { altText } : {}),
  });
  const { uploadUrl, mediaId } = presign.data;

  // Direct PUT to S3/MinIO; do not send auth headers, do not use mediaClient.
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (ev) => {
      if (onProgress && ev.total) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    },
  });

  await mediaClient.post(`/api/uploads/${mediaId}/confirm`, {});
  return presign.data;
}

export function isAllowedType(type: string): type is
  | "image/jpeg"
  | "image/png"
  | "image/webp" {
  return type === "image/jpeg" || type === "image/png" || type === "image/webp";
}

export { MEDIA_BASE_URL };
