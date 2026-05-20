"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useGetOrderQuery } from "../../../features/orders/orders.api";
import { formatINR } from "../../../lib/format";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  return orderId ? <Confirming orderId={orderId} /> : <NoOrder />;
}

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <SuccessInner />
      </Suspense>
    </main>
  );
}

function Confirming({ orderId }: { orderId: string }) {
  const [pollMs, setPollMs] = useState(2000);
  const { data, isFetching, refetch } = useGetOrderQuery(orderId, {
    pollingInterval: pollMs,
  });

  useEffect(() => {
    if (data?.status && data.status !== "pending_payment") {
      setPollMs(0);
    }
  }, [data?.status]);

  if (!data) {
    return (
      <div className="rounded-md border border-neutral-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">Confirming your payment…</h1>
        <p className="mt-2 text-sm text-neutral-600">
          This usually takes a few seconds. You can safely leave this page; we&apos;ll email you the
          confirmation.
        </p>
      </div>
    );
  }

  if (data.status === "pending_payment") {
    return (
      <div className="rounded-md border border-neutral-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">Almost there…</h1>
        <p className="mt-2 text-sm text-neutral-600">
          We&apos;re waiting for Razorpay to confirm your payment.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="text-neutral-900 underline"
          >
            Refresh now
          </button>
          {isFetching ? " (checking…)" : ""}
        </p>
      </div>
    );
  }

  if (data.status === "failed") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-semibold text-red-800">Payment didn&apos;t go through</h1>
        <p className="mt-2 text-sm text-red-700">
          We weren&apos;t able to confirm your payment. No amount has been debited.
        </p>
        <Link
          href="/cart"
          className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-8 text-center">
      <h1 className="text-xl font-semibold text-emerald-900">Order confirmed 🎉</h1>
      <p className="mt-2 text-sm text-emerald-900">
        Order ID: <span className="font-mono">{data.id.slice(0, 8)}</span>
      </p>
      <p className="mt-1 text-sm text-emerald-900">
        Total paid: {formatINR(data.totalPaise, data.currency)}
      </p>
      <p className="mt-4 text-sm text-emerald-900">
        We&apos;ve emailed your invoice. You can also download it from your order page.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href={`/orders/${data.id}`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          View order
        </Link>
        <Link
          href="/orders"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800"
        >
          My orders
        </Link>
      </div>
    </div>
  );
}

function NoOrder() {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-8 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Order details not found</h1>
      <Link
        href="/orders"
        className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
      >
        View my orders
      </Link>
    </div>
  );
}
