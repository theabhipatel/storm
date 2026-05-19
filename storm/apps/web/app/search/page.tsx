import { Suspense } from "react";

import { SearchPageBody } from "./SearchPageBody";

// Search is CSR — query-driven, frequent re-fetches, and shareable via URL.
// The body uses useSearchParams(), so it must sit inside a Suspense boundary.
export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageBody />
    </Suspense>
  );
}
