"use client";

import { ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS: { value: string; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "popularity", label: "Popularity" },
  { value: "newness", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const current = params.get("sort") ?? "relevance";

  function update(value: string): void {
    const next = new URLSearchParams(params.toString());
    if (value === "relevance") next.delete("sort");
    else next.set("sort", value);
    next.delete("cursor");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm focus-within:border-primary">
      <ArrowUpDown className="h-4 w-4 text-text-subtle" aria-hidden="true" />
      <span className="hidden text-text-muted sm:inline">Sort by</span>
      <select
        value={current}
        onChange={(e) => update(e.target.value)}
        className="border-0 bg-transparent text-sm font-semibold text-text focus:outline-none focus:ring-0"
        aria-label="Sort results"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
