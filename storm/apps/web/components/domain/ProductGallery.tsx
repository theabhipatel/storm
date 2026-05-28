"use client";

import { useState } from "react";

import type { MediaAssetDto } from "@storm/contracts";

import { fallbackImageUrl, isPlaceholderAsset } from "../../lib/productImage";

export function ProductGallery({
  assets,
  fallbackSeed,
}: {
  assets: MediaAssetDto[];
  fallbackSeed?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const displayAssets = assets.filter((a) => !isPlaceholderAsset(a));
  if (displayAssets.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackImageUrl(fallbackSeed, 800)}
          alt={fallbackSeed ?? "Product image"}
          className="aspect-square w-full object-cover"
        />
      </div>
    );
  }
  const active = displayAssets[activeIdx] ?? displayAssets[0]!;
  const heroUrl =
    active.thumbnails.find((t) => t.variant === "lg")?.url ?? active.original;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {displayAssets.length > 1 ? (
        <ul className="order-2 flex max-h-[420px] gap-2 overflow-x-auto sm:order-1 sm:max-h-none sm:w-16 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden">
          {displayAssets.map((a, i) => {
            const thumbUrl =
              a.thumbnails.find((t) => t.variant === "sm")?.url ?? a.original;
            const active = i === activeIdx;
            return (
              <li key={a.id} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  onMouseEnter={() => setActiveIdx(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`block h-16 w-16 overflow-hidden rounded-md border-2 transition ${
                    active
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={a.altText ?? ""}
                    loading="lazy"
                    className="h-full w-full object-contain p-1"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <div className="order-1 flex-1 overflow-hidden rounded-lg border border-border bg-surface sm:order-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroUrl}
          alt={active.altText ?? ""}
          className="aspect-square w-full object-contain p-4"
        />
      </div>
    </div>
  );
}
