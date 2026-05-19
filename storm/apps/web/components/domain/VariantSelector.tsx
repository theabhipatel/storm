"use client";

import { useState } from "react";

import type { VariantDto } from "@storm/contracts";

import { formatINR } from "../../lib/format";

export function VariantSelector({
  variants,
  basePrice,
  currency,
}: {
  variants: VariantDto[];
  basePrice: number;
  currency: string;
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? null);
  if (variants.length === 0) return null;
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]!;
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Variant
      </p>
      <ul className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => setSelectedId(v.id)}
              className={
                "rounded-md border px-3 py-1.5 text-sm " +
                (v.id === selected.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50")
              }
            >
              {v.name}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-neutral-700">
        SKU: <span className="font-mono">{selected.sku}</span> · Price:{" "}
        {formatINR(selected.price ?? basePrice, currency)}
      </p>
    </div>
  );
}
