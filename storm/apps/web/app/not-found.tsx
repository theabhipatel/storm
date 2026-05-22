import { Compass, Home, LayoutGrid } from "lucide-react";
import Link from "next/link";

import { NotFoundSearch } from "../components/domain/NotFoundSearch";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Compass className="h-8 w-8" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">
        404 — page not found
      </p>
      <h1 className="mt-2 text-3xl font-bold text-text">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        The link may be broken or the page may have moved. Try searching for what you
        need or head back home.
      </p>
      <div className="mt-6 w-full">
        <NotFoundSearch />
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface-muted"
        >
          <LayoutGrid className="h-4 w-4" />
          Browse all
        </Link>
      </div>
    </main>
  );
}
