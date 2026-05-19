"use client";

import { useState } from "react";

import type { MediaAssetDto } from "@storm/contracts";

export function ProductGallery({ assets }: { assets: MediaAssetDto[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (assets.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500">
        No image
      </div>
    );
  }
  const active = assets[activeIdx] ?? assets[0]!;
  const heroUrl =
    active.thumbnails.find((t) => t.variant === "lg")?.url ?? active.original;
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroUrl}
          alt={active.altText ?? ""}
          className="aspect-square w-full object-contain"
        />
      </div>
      {assets.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {assets.map((a, i) => {
            const thumbUrl =
              a.thumbnails.find((t) => t.variant === "sm")?.url ?? a.original;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={
                    "block w-full overflow-hidden rounded-md border " +
                    (i === activeIdx
                      ? "border-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-200")
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={a.altText ?? ""}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
