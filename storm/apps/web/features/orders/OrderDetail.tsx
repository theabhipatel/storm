"use client";

import { ArrowLeft, Download, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Order, OrderHistoryEntry, OrderStatus } from "@storm/contracts";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
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

  if (isLoading) return <p className="text-sm text-text-muted">Loading…</p>;
  if (isError || !data)
    return <p className="text-sm font-medium text-danger">Order not found.</p>;

  const currentStatus = data.status as OrderStatus;
  const canDownloadInvoice =
    currentStatus !== "pending_payment" && currentStatus !== "failed";
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
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text">
            Order #{data.id.slice(0, 8)}
          </h2>
          <p className="text-xs text-text-subtle">
            Placed on {formatIst(data.createdAt)} (IST)
          </p>
        </div>
        <OrderStatusBadge status={currentStatus} />
      </header>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <StatusTimeline history={data.history ?? []} />

      <Card padding="lg">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text">
          Items
        </h3>
        <ul className="space-y-4 text-sm">
          {data.items.map((item) => {
            const imageUrl = (item.image as { url?: string } | null | undefined)?.url;
            return (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-contain p-1"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold text-text">{item.name}</p>
                    <p className="mt-0.5 text-xs text-text-subtle">
                      {formatINR(item.unitPricePaise, data.currency)} × {item.qty}
                    </p>
                  </div>
                </div>
                <span className="whitespace-nowrap font-bold text-text">
                  {formatINR(item.lineTotalPaise, data.currency)}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card padding="lg">
        <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text">
          <MapPin className="h-4 w-4 text-primary" />
          Delivery address
        </h3>
        <AddressSummary address={data.address} />
      </Card>

      <Card padding="lg">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text">
          Payment
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          <dt className="text-text-muted">Subtotal</dt>
          <dd className="text-right text-text">
            {formatINR(data.subtotalPaise, data.currency)}
          </dd>
          <dt className="text-text-muted">Shipping</dt>
          <dd className="text-right text-text">
            {data.shippingFeePaise === 0
              ? "FREE"
              : formatINR(data.shippingFeePaise, data.currency)}
          </dd>
          <dt className="border-t border-dashed border-border pt-2 font-bold text-text">
            Total
          </dt>
          <dd className="border-t border-dashed border-border pt-2 text-right font-bold text-text">
            {formatINR(data.totalPaise, data.currency)}
          </dd>
          <dt className="text-text-muted">Method</dt>
          <dd className="text-right capitalize text-text">{data.paymentMethod}</dd>
          {data.confirmedAt ? (
            <>
              <dt className="text-text-muted">Paid at</dt>
              <dd className="text-right text-text">{formatIst(data.confirmedAt)} (IST)</dd>
            </>
          ) : null}
        </dl>
      </Card>

      <div className="flex flex-wrap gap-2">
        {canDownloadInvoice ? (
          <a
            href={`/api/orders/${data.id}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
          >
            <Download className="h-4 w-4" />
            Download invoice
          </a>
        ) : null}
        {canCancel ? (
          <Button variant="danger" onClick={() => setShowCancel(true)}>
            Cancel order
          </Button>
        ) : null}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
      </div>

      {!TERMINAL.has(currentStatus) ? (
        <p className="text-xs text-text-subtle">
          This page refreshes automatically every 10 seconds.
        </p>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-24 right-6 z-40 rounded-md bg-dark px-4 py-2.5 text-sm font-medium text-dark-foreground shadow-elevated md:bottom-6"
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
    <Card padding="lg">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text">
        Status timeline
      </h3>
      <ol className="space-y-3 text-sm">
        {history.map((h) => (
          <li key={h.id} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary"
              />
              <div>
                <p className="font-semibold text-text">
                  {(h.fromStatus ?? "Created") + " → " + h.toStatus}
                </p>
                {h.reason ? (
                  <p className="text-xs text-text-subtle">{h.reason}</p>
                ) : null}
              </div>
            </div>
            <span className="whitespace-nowrap text-xs text-text-subtle">
              {formatIst(h.changedAt)} IST
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function AddressSummary({ address }: { address: Order["address"] }) {
  return (
    <div className="text-sm">
      <p className="font-semibold text-text">{address.fullName}</p>
      <p className="text-text-muted">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p className="text-text-muted">
        {address.city}, {address.state} {address.pincode}
      </p>
      <p className="text-text-subtle">{address.phone}</p>
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
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h4 className="text-base font-semibold text-text">Cancel this order?</h4>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="-mr-2 -mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-text-subtle hover:bg-surface-muted hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Any reserved stock will be released and you&apos;ll receive a confirmation email.
        </p>
        <label className="mt-4 block text-sm font-medium text-text">
          Reason (optional)
          <textarea
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="Why are you cancelling?"
          />
        </label>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} fullWidth>
            Keep order
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy} fullWidth>
            {busy ? "Cancelling…" : "Cancel order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
