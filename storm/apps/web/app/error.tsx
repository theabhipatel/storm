"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[storm-error-boundary]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Something went wrong
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
        We hit an unexpected error
      </h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600">
        Our team has been notified. You can try again, or go back home.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[11px] text-neutral-400">
          ref: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-400"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
