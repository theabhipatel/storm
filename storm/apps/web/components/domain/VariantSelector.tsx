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
    <div className="space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
        Choose variant
      </p>
      <ul className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.id === selected.id;
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setSelectedId(v.id)}
                className={`rounded-md border-2 px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-text hover:border-primary/40"
                }`}
                aria-pressed={active}
              >
                {v.name}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-text-muted">
        SKU: <span className="font-mono text-text">{selected.sku}</span> · Price:{" "}
        <span className="font-semibold text-text">
          {formatINR(selected.price ?? basePrice, currency)}
        </span>
      </p>
    </div>
  );
}
