import { useEffect, useRef, useState } from "react";

import {
  useAttachMediaMutation,
  useDetachMediaMutation,
  type ProductMediaDto,
} from "../features/catalog/catalog.api";
import {
  useGetMediaBatchQuery,
  useUpdateMediaAltMutation,
  uploadImageFile,
  type MediaAssetDto,
} from "../features/media/media.api";

export function MediaUploader({
  productId,
  media,
}: {
  productId: string;
  media: ProductMediaDto[];
}) {
  const sortedMedia = [...media].sort((a, b) => a.order - b.order);
  const mediaIds = sortedMedia.map((m) => m.mediaId);
  const { data, refetch } = useGetMediaBatchQuery(mediaIds, {
    skip: mediaIds.length === 0,
  });
  const assetsById = new Map<string, MediaAssetDto>(
    (data?.items ?? []).map((m) => [m.id, m]),
  );

  const [attach] = useAttachMediaMutation();
  const [detach] = useDetachMediaMutation();
  const [updateAlt] = useUpdateMediaAltMutation();
  const [uploading, setUploading] = useState<{ name: string; pct: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!data) return;
    const anyPending = data.items.some((m) => m.status !== "ready" && m.status !== "failed");
    if (!anyPending) return;
    const t = setInterval(() => void refetch(), 2_000);
    return () => clearInterval(t);
  }, [data, refetch]);

  async function onFilesSelected(files: FileList) {
    setError(null);
    const list = Array.from(files);
    setUploading(list.map((f) => ({ name: f.name, pct: 0 })));
    try {
      for (const [i, file] of list.entries()) {
        const { mediaId } = await uploadImageFile({
          file,
          altText: file.name,
          onProgress: (pct) =>
            setUploading((u) => u.map((it, idx) => (idx === i ? { ...it, pct } : it))),
        });
        await attach({ productId, mediaId }).unwrap();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading([]);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) void onFilesSelected(e.dataTransfer.files);
  }

  async function makePrimary(mediaId: string) {
    await attach({ productId, mediaId, isPrimary: true }).unwrap();
  }

  async function saveAlt(mediaId: string, altText: string) {
    await updateAlt({ id: mediaId, altText: altText.length > 0 ? altText : null }).unwrap();
  }

  // Drag-reorder: persist new `order` for each tile via the attach upsert.
  async function reorderTo(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      return;
    }
    const reordered = [...sortedMedia];
    const [moved] = reordered.splice(dragIdx, 1);
    if (!moved) {
      setDragIdx(null);
      return;
    }
    reordered.splice(targetIdx, 0, moved);
    setDragIdx(null);
    for (const [i, m] of reordered.entries()) {
      await attach({
        productId,
        mediaId: m.mediaId,
        order: i,
        isPrimary: m.isPrimary,
      }).unwrap();
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600"
      >
        <p>Drag and drop images here</p>
        <p className="text-xs text-neutral-500">JPEG, PNG, WebP up to 10MB each</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
        >
          Browse files
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
          className="hidden"
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {error}
        </p>
      )}

      {uploading.length > 0 && (
        <ul className="space-y-1 text-xs text-neutral-600">
          {uploading.map((u) => (
            <li key={u.name}>
              {u.name} — {u.pct}%
            </li>
          ))}
        </ul>
      )}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sortedMedia.map((m, idx) => {
          const asset = assetsById.get(m.mediaId);
          const thumbUrl =
            asset?.thumbnails.find((t) => t.variant === "sm")?.url ?? asset?.original ?? null;
          const status = asset?.status ?? "loading";
          return (
            <MediaTile
              key={m.mediaId}
              media={m}
              idx={idx}
              dragIdx={dragIdx}
              setDragIdx={setDragIdx}
              onDropTo={(target) => void reorderTo(target)}
              thumbUrl={thumbUrl}
              status={status}
              altText={asset?.altText ?? ""}
              onMakePrimary={() => void makePrimary(m.mediaId)}
              onRemove={() => {
                if (confirm("Remove this image?"))
                  void detach({ productId, mediaId: m.mediaId }).unwrap();
              }}
              onSaveAlt={(v) => void saveAlt(m.mediaId, v)}
            />
          );
        })}
      </ul>
    </div>
  );
}

function MediaTile({
  media,
  idx,
  dragIdx,
  setDragIdx,
  onDropTo,
  thumbUrl,
  status,
  altText,
  onMakePrimary,
  onRemove,
  onSaveAlt,
}: {
  media: ProductMediaDto;
  idx: number;
  dragIdx: number | null;
  setDragIdx: (idx: number | null) => void;
  onDropTo: (idx: number) => void;
  thumbUrl: string | null;
  status: string;
  altText: string;
  onMakePrimary: () => void;
  onRemove: () => void;
  onSaveAlt: (alt: string) => void;
}) {
  const [draft, setDraft] = useState(altText);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setDraft(altText);
    setDirty(false);
  }, [altText]);

  return (
    <li
      draggable
      onDragStart={() => setDragIdx(idx)}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={() => setDragIdx(null)}
      onDrop={(e) => {
        e.preventDefault();
        onDropTo(idx);
      }}
      className={
        "relative overflow-hidden rounded-md border transition " +
        (media.isPrimary
          ? "border-emerald-400 ring-2 ring-emerald-200"
          : dragIdx === idx
          ? "border-neutral-900 opacity-60"
          : "border-neutral-200")
      }
    >
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={altText}
          className="aspect-square w-full cursor-move object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-neutral-100 text-xs text-neutral-500">
          {status}
        </div>
      )}
      <div className="space-y-2 border-t border-neutral-100 bg-white p-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="truncate">
            {media.isPrimary ? <strong>Primary</strong> : <span>#{media.order + 1}</span>}
          </span>
          <span className="text-neutral-400">{status}</span>
        </div>
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Alt text
          </label>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setDirty(e.target.value !== altText);
            }}
            onBlur={() => {
              if (dirty) onSaveAlt(draft);
            }}
            placeholder="describe the image"
            className="mt-0.5 block w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
        </div>
        <div className="flex gap-1 border-t border-neutral-100 pt-1">
          {!media.isPrimary && (
            <button type="button" onClick={onMakePrimary} className="text-neutral-700 hover:underline">
              Make primary
            </button>
          )}
          <button type="button" onClick={onRemove} className="ml-auto text-red-700 hover:underline">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
