"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { FacetsResponse } from "@storm/contracts";

import { formatINR } from "../../lib/format";

export interface FilterSidebarProps {
  facets: FacetsResponse | null | undefined;
  // When set, the category filter is fixed by the parent route (e.g. /c/[slug])
  // and the category facet section is hidden — the user has already drilled in.
  hideCategoryFacet?: boolean;
}

export function FilterSidebar({ facets, hideCategoryFacet }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selectedBrands = new Set((params.get("brandId") ?? "").split(",").filter(Boolean));
  const selectedCategory = params.get("categoryId") ?? "";
  const inStock = params.get("inStock") === "true";
  const priceMin = params.get("priceMin") ?? "";
  const priceMax = params.get("priceMax") ?? "";

  const [minDraft, setMinDraft] = useState(priceMin);
  const [maxDraft, setMaxDraft] = useState(priceMax);

  useEffect(() => {
    setMinDraft(priceMin);
    setMaxDraft(priceMax);
  }, [priceMin, priceMax]);

  function applyParam(updater: (next: URLSearchParams) => void): void {
    const next = new URLSearchParams(params.toString());
    updater(next);
    next.delete("cursor");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleBrand(value: string): void {
    applyParam((next) => {
      const set = new Set((next.get("brandId") ?? "").split(",").filter(Boolean));
      if (set.has(value)) set.delete(value);
      else set.add(value);
      if (set.size === 0) next.delete("brandId");
      else next.set("brandId", [...set].join(","));
    });
  }

  function setInStock(on: boolean): void {
    applyParam((next) => {
      if (on) next.set("inStock", "true");
      else next.delete("inStock");
    });
  }

  function applyPrice(): void {
    applyParam((next) => {
      if (minDraft) next.set("priceMin", minDraft);
      else next.delete("priceMin");
      if (maxDraft) next.set("priceMax", maxDraft);
      else next.delete("priceMax");
    });
  }

  function clearAll(): void {
    applyParam((next) => {
      const q = next.get("q");
      const sort = next.get("sort");
      next.forEach((_v, k) => next.delete(k));
      if (q) next.set("q", q);
      if (sort) next.set("sort", sort);
    });
  }

  const brands = facets?.brands ?? [];
  const priceBuckets = facets?.priceBuckets ?? [];
  const categories = facets?.categories ?? [];

  function setCategory(value: string | null): void {
    applyParam((next) => {
      if (value) next.set("categoryId", value);
      else next.delete("categoryId");
    });
  }

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">Filters</h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-neutral-500 underline hover:text-neutral-900"
        >
          Clear all
        </button>
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Price (₹)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minDraft ? paiseToRupees(minDraft) : ""}
            onChange={(e) => setMinDraft(e.target.value ? `${Number(e.target.value) * 100}` : "")}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxDraft ? paiseToRupees(maxDraft) : ""}
            onChange={(e) => setMaxDraft(e.target.value ? `${Number(e.target.value) * 100}` : "")}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={applyPrice}
            className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Go
          </button>
        </div>
        {priceBuckets.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {priceBuckets.map((b, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() =>
                    applyParam((next) => {
                      next.set("priceMin", String(b.from));
                      if (b.to !== null) next.set("priceMax", String(b.to));
                      else next.delete("priceMax");
                    })
                  }
                  className="flex w-full items-center justify-between text-left text-neutral-700 hover:text-neutral-900"
                >
                  <span>
                    {formatINR(b.from, "INR")}
                    {" – "}
                    {b.to !== null ? formatINR(b.to, "INR") : "above"}
                  </span>
                  <span className="text-xs text-neutral-500">{b.count}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Availability
        </h3>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          In stock only{" "}
          {facets ? (
            <span className="text-xs text-neutral-500">({facets.inStockCount})</span>
          ) : null}
        </label>
      </section>

      {!hideCategoryFacet && categories.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Category
          </h3>
          <ul className="space-y-1 text-sm">
            {categories.map((c) => (
              <li key={c.value}>
                <button
                  type="button"
                  onClick={() => setCategory(c.value === selectedCategory ? null : c.value)}
                  className={`flex w-full items-center justify-between text-left text-neutral-700 hover:text-neutral-900 ${
                    c.value === selectedCategory ? "font-semibold text-neutral-900" : ""
                  }`}
                >
                  <span className="flex-1 truncate">{c.label}</span>
                  <span className="text-xs text-neutral-500">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Brand
        </h3>
        {brands.length === 0 ? (
          <p className="text-xs text-neutral-500">No options</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {brands.map((b) => (
              <li key={b.value}>
                <label className="flex items-center gap-2 text-neutral-700">
                  <input
                    type="checkbox"
                    checked={selectedBrands.has(b.value)}
                    onChange={() => toggleBrand(b.value)}
                  />
                  <span className="flex-1 truncate capitalize">{b.label}</span>
                  <span className="text-xs text-neutral-500">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

function paiseToRupees(value: string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return String(Math.round(n / 100));
}
