"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";

import type { MediaAssetDto } from "@storm/contracts";

export function ProductGallery({ assets }: { assets: MediaAssetDto[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (assets.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface text-text-subtle">
        <ImageIcon className="h-10 w-10" aria-hidden="true" />
        <span className="text-sm">No image</span>
      </div>
    );
  }
  const active = assets[activeIdx] ?? assets[0]!;
  const heroUrl =
    active.thumbnails.find((t) => t.variant === "lg")?.url ?? active.original;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {assets.length > 1 ? (
        <ul className="order-2 flex max-h-[420px] gap-2 overflow-x-auto sm:order-1 sm:max-h-none sm:w-16 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden">
          {assets.map((a, i) => {
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
