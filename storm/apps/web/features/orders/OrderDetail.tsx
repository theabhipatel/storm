"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Order, OrderHistoryEntry, OrderStatus } from "@storm/contracts";

import { formatINR } from "../../lib/format";
import { useCancelOrderMutation, useGetOrderQuery } from "./orders.api";
import { OrderStatusBadge } from "./OrderStatusBadge";

const CANCELLABLE = new Set<OrderStatus>(["pending_payment", "confirmed"]);
const TERMINAL = new Set<OrderStatus>(["delivered", "cancelled", "failed"]);
const POLL_MS = 10_000;

const STATUS_TOAST: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Your order has been confirmed",
  processing: "Your order is being prepared",
  shipped: "Your order is on the way",
  delivered: "Your order was delivered",
  cancelled: "Your order has been cancelled",
  failed: "Your order could not be completed",
};

function formatIst(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetOrderQuery(orderId);
  const liveStatus = data?.status as OrderStatus | undefined;
  const prevStatusRef = useRef<OrderStatus | undefined>(undefined);
  useEffect(() => {
    if (!liveStatus || TERMINAL.has(liveStatus)) return;
    const id = setInterval(() => {
      void refetch();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [liveStatus, refetch]);
  useEffect(() => {
    if (!liveStatus) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = liveStatus;
    if (prev && prev !== liveStatus) {
      setToast(STATUS_TOAST[liveStatus]);
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [liveStatus]);
  const [cancelOrder, cancelState] = useCancelOrderMutation();

  if (isLoading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (isError || !data) return <p className="text-sm text-red-700">Order not found.</p>;

  const currentStatus = data.status as OrderStatus;

  const canDownloadInvoice = currentStatus !== "pending_payment" && currentStatus !== "failed";
  const canCancel = CANCELLABLE.has(currentStatus);

  async function handleCancel(): Promise<void> {
    setError(null);
    try {
      await cancelOrder({
        id: orderId,
        ...(cancelReason.trim() ? { reason: cancelReason.trim() } : {}),
      }).unwrap();
      setShowCancel(false);
      setCancelReason("");
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
            Placed on {formatIst(data.createdAt)} (IST)
          </p>
        </div>
        <OrderStatusBadge status={currentStatus} />
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <StatusTimeline history={data.history ?? []} />

      <section className="rounded-md border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Items</h3>
        <ul className="mt-3 space-y-3 text-sm">
          {data.items.map((item) => {
            const imageUrl = (item.image as { url?: string } | null | undefined)?.url;
            return (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-14 w-14 rounded object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded bg-neutral-100" />
                  )}
                  <div>
                    <p className="font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">
                      {formatINR(item.unitPricePaise, data.currency)} × {item.qty}
                    </p>
                  </div>
                </div>
                <span className="whitespace-nowrap font-medium text-neutral-900">
                  {formatINR(item.lineTotalPaise, data.currency)}
                </span>
              </li>
            );
          })}
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
          <dt className="text-neutral-600">Method</dt>
          <dd className="text-right">{data.paymentMethod}</dd>
          {data.confirmedAt ? (
            <>
              <dt className="text-neutral-600">Paid at</dt>
              <dd className="text-right">{formatIst(data.confirmedAt)} (IST)</dd>
            </>
          ) : null}
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
            onClick={() => setShowCancel(true)}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Cancel order
          </button>
        )}
        <Link
          href="/orders"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800"
        >
          Back to orders
        </Link>
      </div>

      {!TERMINAL.has(currentStatus) ? (
        <p className="text-xs text-neutral-500">
          This page refreshes automatically every 10 seconds.
        </p>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-40 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}

      {showCancel ? (
        <CancelDialog
          reason={cancelReason}
          onReason={setCancelReason}
          onCancel={() => {
            setShowCancel(false);
            setCancelReason("");
          }}
          onConfirm={handleCancel}
          busy={cancelState.isLoading}
        />
      ) : null}
    </div>
  );
}

function StatusTimeline({ history }: { history: OrderHistoryEntry[] }) {
  if (history.length === 0) return null;
  return (
    <section className="rounded-md border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-900">Status timeline</h3>
      <ol className="mt-3 space-y-2 text-sm">
        {history.map((h) => (
          <li key={h.id} className="flex justify-between gap-3">
            <div>
              <p className="font-medium text-neutral-900">
                {(h.fromStatus ?? "—") + " → " + h.toStatus}
              </p>
              {h.reason ? (
                <p className="text-xs text-neutral-500">{h.reason}</p>
              ) : null}
            </div>
            <span className="whitespace-nowrap text-xs text-neutral-500">
              {formatIst(h.changedAt)} IST
            </span>
          </li>
        ))}
      </ol>
    </section>
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

function CancelDialog({
  reason,
  onReason,
  onCancel,
  onConfirm,
  busy,
}: {
  reason: string;
  onReason: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-md bg-white p-5 shadow-lg">
        <h4 className="text-base font-semibold text-neutral-900">Cancel this order?</h4>
        <p className="mt-1 text-sm text-neutral-600">
          Any reserved stock will be released and you&apos;ll receive a confirmation email.
        </p>
        <label className="mt-3 block text-sm font-medium text-neutral-700">
          Reason (optional)
          <textarea
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Why are you cancelling?"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800"
          >
            Keep order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Cancelling…" : "Cancel order"}
          </button>
        </div>
      </div>
    </div>
  );
}
