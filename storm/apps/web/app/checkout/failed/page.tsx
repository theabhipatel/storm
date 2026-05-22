"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Card } from "../../../components/ui/Card";

function FailedContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  return (
    <Card padding="lg">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
        <XCircle className="h-9 w-9" />
      </div>
      <h1 className="text-center text-2xl font-bold text-text">
        Payment didn’t complete
      </h1>
      <p className="mt-2 text-center text-sm text-text-muted">
        Don&apos;t worry — no amount has been debited from your account.
      </p>
      {orderId ? (
        <p className="mt-1 text-center text-xs text-text-subtle">
          Reference: <span className="font-mono">{orderId.slice(0, 8)}</span>
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Back to cart
        </Link>
        {orderId ? (
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface-muted"
          >
            View order
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

export default function CheckoutFailedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-text-muted">Loading…</p>}>
        <FailedContent />
      </Suspense>
    </main>
  );
}
