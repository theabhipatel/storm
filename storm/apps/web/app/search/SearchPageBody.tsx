"use client";

import { useSearchParams } from "next/navigation";

import { ProductListing } from "../../components/domain/ProductListing";

export function SearchPageBody() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  return (
    <main className="mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text">
          {q ? (
            <>
              Results for{" "}
              <span className="text-primary">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            "All products"
          )}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Use filters to narrow down what you&apos;re looking for.
        </p>
      </div>
      <ProductListing surface="search" />
    </main>
  );
}
