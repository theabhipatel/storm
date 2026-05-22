"use client";

import { ChevronDown, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { FacetsResponse } from "@storm/contracts";

import { formatINR } from "../../lib/format";

export interface FilterSidebarProps {
  facets: FacetsResponse | null | undefined;
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

  function setCategory(value: string | null): void {
    applyParam((next) => {
      if (value) next.set("categoryId", value);
      else next.delete("categoryId");
    });
  }

  function clearAll(): void {
    applyParam((next) => {
      const q = next.get("q");
      const sort = next.get("sort");
      [...next.keys()].forEach((k) => next.delete(k));
      if (q) next.set("q", q);
      if (sort) next.set("sort", sort);
    });
  }

  const brands = facets?.brands ?? [];
  const priceBuckets = facets?.priceBuckets ?? [];
  const categories = facets?.categories ?? [];
  const hasAnyFilter =
    !!params.get("brandId") ||
    !!params.get("priceMin") ||
    !!params.get("priceMax") ||
    !!params.get("inStock") ||
    !!params.get("categoryId");

  return (
    <aside className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text">Filters</h2>
        {hasAnyFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-primary hover:text-primary-hover"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minDraft ? paiseToRupees(minDraft) : ""}
            onChange={(e) =>
              setMinDraft(e.target.value ? `${Number(e.target.value) * 100}` : "")
            }
            className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <span className="text-text-subtle">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxDraft ? paiseToRupees(maxDraft) : ""}
            onChange={(e) =>
              setMaxDraft(e.target.value ? `${Number(e.target.value) * 100}` : "")
            }
            className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="button"
            onClick={applyPrice}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Go
          </button>
        </div>
        {priceBuckets.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm">
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
                  className="flex w-full items-center justify-between rounded px-1 py-0.5 text-left text-text hover:text-primary"
                >
                  <span>
                    {formatINR(b.from, "INR")}
                    {" – "}
                    {b.to !== null ? formatINR(b.to, "INR") : "above"}
                  </span>
                  <span className="text-xs text-text-subtle">{b.count}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          In stock only{" "}
          {facets ? (
            <span className="text-xs text-text-subtle">({facets.inStockCount})</span>
          ) : null}
        </label>
      </FilterGroup>

      {!hideCategoryFacet && categories.length > 0 && (
        <FilterGroup title="Category">
          <ul className="space-y-1.5 text-sm">
            {categories.map((c) => {
              const active = c.value === selectedCategory;
              return (
                <li key={c.value}>
                  <button
                    type="button"
                    onClick={() => setCategory(active ? null : c.value)}
                    className={`flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left transition ${
                      active ? "font-semibold text-primary" : "text-text hover:text-primary"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {active ? <X className="h-3 w-3 flex-shrink-0" /> : null}
                      {c.label}
                    </span>
                    <span className="text-xs text-text-subtle">{c.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Brand">
        {brands.length === 0 ? (
          <p className="text-xs text-text-subtle">No options</p>
        ) : (
          <ul className="max-h-60 space-y-1.5 overflow-y-auto pr-1 text-sm">
            {brands.map((b) => (
              <li key={b.value}>
                <label className="flex cursor-pointer items-center gap-2 text-text">
                  <input
                    type="checkbox"
                    checked={selectedBrands.has(b.value)}
                    onChange={() => toggleBrand(b.value)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="flex-1 truncate capitalize">{b.label}</span>
                  <span className="text-xs text-text-subtle">{b.count}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-text-subtle transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

function paiseToRupees(value: string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return String(Math.round(n / 100));
}
