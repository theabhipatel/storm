"use client";

import { AlertOctagon, Home, RefreshCw } from "lucide-react";
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
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle">
        Something went wrong
      </p>
      <h1 className="mt-2 text-3xl font-bold text-text">
        We hit an unexpected error
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        Our team has been notified. You can try again, or head back home.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[11px] text-text-subtle">
          ref: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface-muted"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
