"use client";

import { useState } from "react";
import Link from "next/link";
import type { Order } from "@storm/contracts";

import { formatINR } from "../../lib/format";
import { useCancelOrderMutation, useGetOrderQuery } from "./orders.api";
import { OrderStatusBadge } from "./OrderStatusBadge";

const CANCELLABLE = new Set(["pending_payment", "confirmed"]);

export function OrderDetail({ orderId }: { orderId: string }) {
  const { data, isLoading, isError } = useGetOrderQuery(orderId);
  const [cancelOrder, cancelState] = useCancelOrderMutation();
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (isError || !data) return <p className="text-sm text-red-700">Order not found.</p>;

  const canDownloadInvoice =
    data.status === "confirmed" ||
    data.status === "processing" ||
    data.status === "shipped" ||
    data.status === "delivered";
  const canCancel = CANCELLABLE.has(data.status);

  async function handleCancel(): Promise<void> {
    if (!confirm("Cancel this order?")) return;
    setError(null);
    try {
      await cancelOrder({ id: orderId }).unwrap();
    } catch (err) {
      const message =
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ??
        "Could not cancel the order.";
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Order #{data.id.slice(0, 8)}
          </h2>
          <p className="text-xs text-neutral-500">
            Placed on {new Date(data.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <OrderStatusBadge status={data.status} />
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="rounded-md border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Items</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {data.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name}{" "}
                <span className="text-neutral-500">× {item.qty}</span>
              </span>
              <span className="font-medium text-neutral-900">
                {formatINR(item.lineTotalPaise, data.currency)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Delivery address</h3>
        <AddressSummary address={data.address} />
      </section>

      <section className="rounded-md border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Payment</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-neutral-600">Subtotal</dt>
          <dd className="text-right">{formatINR(data.subtotalPaise, data.currency)}</dd>
          <dt className="text-neutral-600">Shipping</dt>
          <dd className="text-right">
            {data.shippingFeePaise === 0
              ? "FREE"
              : formatINR(data.shippingFeePaise, data.currency)}
          </dd>
          <dt className="font-semibold text-neutral-900">Total</dt>
          <dd className="text-right font-semibold text-neutral-900">
            {formatINR(data.totalPaise, data.currency)}
          </dd>
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
        {canDownloadInvoice && (
          <Link
            href={`/api/orders/${data.id}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Download invoice
          </Link>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelState.isLoading}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelState.isLoading ? "Cancelling…" : "Cancel order"}
          </button>
        )}
        <Link
          href="/orders"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800"
        >
          Back to orders
        </Link>
      </div>
    </div>
  );
}

function AddressSummary({ address }: { address: Order["address"] }) {
  return (
    <div className="mt-2 text-sm text-neutral-700">
      <p className="font-medium text-neutral-900">{address.fullName}</p>
      <p>
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p>
        {address.city}, {address.state} {address.pincode}
      </p>
      <p className="text-neutral-500">{address.phone}</p>
    </div>
  );
}
