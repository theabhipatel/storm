"use client";

import { useSearchParams } from "next/navigation";

import { ProductListing } from "../../components/domain/ProductListing";

export function SearchPageBody() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-neutral-900">
        {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"}
      </h1>
      <div className="mt-6">
        <ProductListing surface="search" />
      </div>
    </main>
  );
}
