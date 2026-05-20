import Link from "next/link";

import { NotFoundSearch } from "../components/domain/NotFoundSearch";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600">
        The link may be broken or the page may have moved. Try searching for
        what you need or head back home.
      </p>
      <div className="mt-6 w-full">
        <NotFoundSearch />
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Back to home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-400"
        >
          Browse all
        </Link>
      </div>
    </main>
  );
}
