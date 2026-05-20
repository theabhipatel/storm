"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailedContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center">
      <h1 className="text-xl font-semibold text-red-800">Payment didn&apos;t complete</h1>
      <p className="mt-2 text-sm text-red-700">
        Don&apos;t worry — no amount has been debited from your account.
      </p>
      {orderId && (
        <p className="mt-1 text-xs text-red-700">
          Reference: <span className="font-mono">{orderId.slice(0, 8)}</span>
        </p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/cart"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to cart
        </Link>
        {orderId && (
          <Link
            href={`/orders/${orderId}`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800"
          >
            View order
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <FailedContent />
      </Suspense>
    </main>
  );
}
