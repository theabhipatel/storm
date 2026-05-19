"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS: { value: string; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "popularity", label: "Popular" },
  { value: "newness", label: "Newest" },
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
    <label className="flex items-center gap-2 text-sm text-neutral-700">
      Sort by
      <select
        value={current}
        onChange={(e) => update(e.target.value)}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
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
