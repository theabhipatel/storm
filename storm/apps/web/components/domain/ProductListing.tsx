"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { SearchHit, SearchResponse } from "@storm/contracts";

import { useFacetsQuery, useSearchQuery } from "../../features/search/search.api";
import type { SearchQueryArgs } from "../../features/search/search.api";
import { ProductGridSkeleton } from "../ui/Skeletons";
import { FilterSidebar } from "./FilterSidebar";
import { ProductGrid } from "./ProductCard";
import { SortDropdown } from "./SortDropdown";

export interface ProductListingProps {
  // Optional initial server-rendered page (skips first fetch).
  initial?: SearchResponse;
  // Forced filter not driven by URL — used by /c/[slug] to scope results.
  forcedCategoryId?: string;
  // Used to pick the empty-state copy.
  surface?: "search" | "category";
}

export function ProductListing({ initial, forcedCategoryId, surface = "search" }: ProductListingProps) {
  const params = useSearchParams();
  const args = useMemo<SearchQueryArgs>(() => {
    const out: SearchQueryArgs = {};
    const q = params.get("q") ?? undefined;
    const brandId = params.get("brandId") ?? undefined;
    const priceMin = params.get("priceMin") ?? undefined;
    const priceMax = params.get("priceMax") ?? undefined;
    const inStock = params.get("inStock") ?? undefined;
    const sort = params.get("sort") ?? undefined;
    if (q) out.q = q;
    if (forcedCategoryId) out.categoryId = forcedCategoryId;
    else {
      const categoryId = params.get("categoryId") ?? undefined;
      if (categoryId) out.categoryId = categoryId;
    }
    if (brandId) out.brandId = brandId;
    if (priceMin) out.priceMin = priceMin;
    if (priceMax) out.priceMax = priceMax;
    if (inStock) out.inStock = inStock;
    if (sort) out.sort = sort;
    return out;
  }, [params, forcedCategoryId]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [accum, setAccum] = useState<SearchHit[]>(initial?.data ?? []);
  const [hasMore, setHasMore] = useState<boolean>(initial?.page.hasMore ?? false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const argsKey = JSON.stringify(args);
  useEffect(() => {
    setAccum(initial?.data ?? []);
    setHasMore(initial?.page.hasMore ?? false);
    setCursor(null);
  }, [argsKey, initial?.data, initial?.page.hasMore]);

  const queryArgs: SearchQueryArgs = { ...args };
  if (cursor) queryArgs.cursor = cursor;
  const { data, isFetching, isError } = useSearchQuery(queryArgs, {
    skip: cursor === null && initial !== undefined,
  });
  const { data: facets } = useFacetsQuery(args);

  useEffect(() => {
    if (!data) return;
    if (cursor === null) {
      setAccum(data.data);
    } else {
      setAccum((prev) => mergeHits(prev, data.data));
    }
    setHasMore(data.page.hasMore);
  }, [data, cursor]);

  const hasActiveFilters =
    !!params.get("brandId") ||
    !!params.get("priceMin") ||
    !!params.get("priceMax") ||
    !!params.get("inStock") ||
    (!forcedCategoryId && !!params.get("categoryId"));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <div className="hidden lg:block">
        <FilterSidebar facets={facets} hideCategoryFacet={!!forcedCategoryId} />
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 lg:hidden"
              aria-label="Open filters"
            >
              Filters
            </button>
            <p className="text-sm text-neutral-600">
              {facets?.totalCount ?? accum.length}{" "}
              {(facets?.totalCount ?? accum.length) === 1 ? "result" : "results"}
            </p>
          </div>
          <SortDropdown />
        </div>
        {isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-900">
            Failed to load results. Try again.
          </div>
        ) : accum.length === 0 && isFetching ? (
          <ProductGridSkeleton />
        ) : accum.length === 0 && !isFetching ? (
          <EmptyState
            surface={surface}
            query={params.get("q") ?? undefined}
            hasActiveFilters={hasActiveFilters}
          />
        ) : (
          <>
            <ProductGrid hits={accum} />
            <div className="mt-6 flex justify-center">
              {hasMore ? (
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => {
                    if (data?.page.nextCursor) setCursor(data.page.nextCursor);
                  }}
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
                >
                  {isFetching ? "Loading…" : "Load more"}
                </button>
              ) : accum.length > 0 ? (
                <span className="text-xs text-neutral-500">End of results</span>
              ) : null}
            </div>
          </>
        )}
      </div>

      {drawerOpen && (
        <FilterDrawer onClose={() => setDrawerOpen(false)}>
          <FilterSidebar facets={facets} hideCategoryFacet={!!forcedCategoryId} />
        </FilterDrawer>
      )}
    </div>
  );
}

function mergeHits(prev: SearchHit[], next: SearchHit[]): SearchHit[] {
  const seen = new Set(prev.map((h) => h.productId));
  const fresh = next.filter((h) => !seen.has(h.productId));
  return [...prev, ...fresh];
}

function EmptyState({
  surface,
  query,
  hasActiveFilters,
}: {
  surface: "search" | "category";
  query?: string | undefined;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function clearFilters(): void {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    const sort = params.get("sort");
    if (sort) next.set("sort", sort);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  let title: string;
  let body: string;
  if (hasActiveFilters) {
    title = "No products match your filters.";
    body = "Try removing some filters.";
  } else if (surface === "search") {
    title = query
      ? `No matches for “${query}”.`
      : "No matches found.";
    body = "Try different keywords or browse categories from the home page.";
  } else {
    title = "No products in this category yet.";
    body = "Check back soon, or explore other categories.";
  }

  return (
    <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      <p className="mt-1 text-xs text-neutral-500">{body}</p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function FilterDrawer({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-neutral-900/40"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
