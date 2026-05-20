import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { OrderStatus } from "@storm/contracts";

import { AdminShell } from "../components/AdminShell";
import { OrderStatusBadge } from "../features/orders/OrderStatusBadge";
import {
  useCancelAdminOrderMutation,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from "../features/orders/orders.api";
import { formatINR } from "../lib/format";

function formatIst(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id ?? "";
  const { data, isLoading, isError } = useGetAdminOrderQuery(orderId);
  const [updateStatus, updateState] = useUpdateOrderStatusMutation();
  const [cancelOrder, cancelState] = useCancelAdminOrderMutation();
  const [selectedNext, setSelectedNext] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <AdminShell title="Order">
        <p className="text-sm text-neutral-500">Loading…</p>
      </AdminShell>
    );
  }
  if (isError || !data) {
    return (
      <AdminShell title="Order">
        <p className="text-sm text-red-700">Order not found.</p>
      </AdminShell>
    );
  }

  const nonCancelTransitions = (data.allowedTransitions ?? []).filter(
    (s) => s !== "cancelled",
  );

  async function handleUpdate(): Promise<void> {
    if (!selectedNext) return;
    setError(null);
    try {
      await updateStatus({
        id: orderId,
        status: selectedNext as OrderStatus,
        ...(note.trim() ? { reason: note.trim() } : {}),
      }).unwrap();
      setShowStatusConfirm(false);
      setSelectedNext("");
      setNote("");
    } catch (err) {
      const apiErr = err as { error?: { message?: string }; data?: { error?: { message?: string } } };
      setError(
        apiErr.data?.error?.message ?? apiErr.error?.message ?? "Could not update status.",
      );
    }
  }

  async function handleCancel(): Promise<void> {
    if (!cancelReason.trim()) {
      setError("Reason is required when an admin cancels an order.");
      return;
    }
    setError(null);
    try {
      await cancelOrder({ id: orderId, reason: cancelReason.trim() }).unwrap();
      setShowCancel(false);
      setCancelReason("");
    } catch (err) {
      const apiErr = err as { error?: { message?: string }; data?: { error?: { message?: string } } };
      setError(
        apiErr.data?.error?.message ?? apiErr.error?.message ?? "Could not cancel the order.",
      );
    }
  }

  const canCancel = (data.allowedTransitions ?? []).includes("cancelled");

  return (
    <AdminShell title={`Order #${orderId.slice(0, 8)}`}>
      <section className="space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              Order #{orderId.slice(0, 8)}
            </h1>
            <p className="text-xs text-neutral-500 font-mono">{orderId}</p>
            <p className="mt-1 text-sm text-neutral-700">
              Placed by{" "}
              <Link
                to={`/users/${data.userId}`}
                className="text-neutral-900 underline-offset-2 hover:underline"
              >
                {data.customerName} ({data.customerEmail})
              </Link>{" "}
              on {formatIst(data.createdAt)} IST
            </p>
          </div>
          <OrderStatusBadge status={data.status as OrderStatus} />
        </header>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <section className="rounded-md border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Status transition</h2>
          {nonCancelTransitions.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">
              No further transitions available from this state.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="flex flex-col text-xs text-neutral-600">
                Next status
                <select
                  value={selectedNext}
                  onChange={(e) => setSelectedNext(e.target.value as OrderStatus | "")}
                  className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                >
                  <option value="">Select…</option>
                  {nonCancelTransitions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-1 flex-col text-xs text-neutral-600">
                Note (optional)
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={!selectedNext || updateState.isLoading}
                onClick={() => setShowStatusConfirm(true)}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {updateState.isLoading ? "Updating…" : "Update status"}
              </button>
            </div>
          )}
          {canCancel && (
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Cancel order
              </button>
            </div>
          )}
        </section>

        <section className="rounded-md border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Items</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="py-1">SKU</th>
                <th>Name</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2 font-mono text-xs">{it.sku}</td>
                  <td className="py-2">{it.name}</td>
                  <td className="py-2 text-right">{it.qty}</td>
                  <td className="py-2 text-right">{formatINR(it.unitPricePaise, data.currency)}</td>
                  <td className="py-2 text-right font-semibold">
                    {formatINR(it.lineTotalPaise, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-3 ml-auto grid w-fit grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <dt className="text-neutral-600">Subtotal</dt>
            <dd className="text-right">{formatINR(data.subtotalPaise, data.currency)}</dd>
            <dt className="text-neutral-600">Shipping</dt>
            <dd className="text-right">{formatINR(data.shippingFeePaise, data.currency)}</dd>
            <dt className="font-semibold text-neutral-900">Total</dt>
            <dd className="text-right font-semibold text-neutral-900">
              {formatINR(data.totalPaise, data.currency)}
            </dd>
          </dl>
        </section>

        <section className="rounded-md border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Delivery address</h2>
          <p className="mt-2 text-sm text-neutral-700">
            <span className="font-medium text-neutral-900">{data.address.fullName}</span>
            <br />
            {data.address.line1}
            {data.address.line2 ? `, ${data.address.line2}` : ""}
            <br />
            {data.address.city}, {data.address.state} {data.address.pincode}
            <br />
            <span className="text-neutral-500">{data.address.phone}</span>
          </p>
        </section>

        <section className="rounded-md border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Payment</h2>
          {data.payment ? (
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-neutral-600">Provider</dt>
              <dd>Razorpay</dd>
              <dt className="text-neutral-600">Razorpay order ID</dt>
              <dd className="font-mono text-xs">{data.payment.razorpayOrderId}</dd>
              <dt className="text-neutral-600">Razorpay payment ID</dt>
              <dd className="font-mono text-xs">{data.payment.razorpayPaymentId ?? "—"}</dd>
              <dt className="text-neutral-600">Status</dt>
              <dd>{data.payment.status}</dd>
              <dt className="text-neutral-600">Amount</dt>
              <dd>{formatINR(data.payment.amountPaise, data.payment.currency)}</dd>
              <dt className="text-neutral-600">Method</dt>
              <dd>{data.payment.method ?? "—"}</dd>
              <dt className="text-neutral-600">Captured at</dt>
              <dd>{formatIst(data.payment.capturedAt)}</dd>
              {data.payment.failureReason ? (
                <>
                  <dt className="text-neutral-600">Failure</dt>
                  <dd>{data.payment.failureReason}</dd>
                </>
              ) : null}
            </dl>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">No payment record found.</p>
          )}
        </section>

        <section className="rounded-md border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Inventory reservations</h2>
          {data.reservations.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">No reservation records.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="py-1">SKU</th>
                  <th className="text-right">Qty</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.reservations.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 font-mono text-xs">{r.sku}</td>
                    <td className="py-2 text-right">{r.qty}</td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2 text-xs text-neutral-500">{formatIst(r.createdAt)}</td>
                    <td className="py-2 text-xs text-neutral-500">{formatIst(r.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-md border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Audit trail</h2>
          {data.history.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">No history recorded.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {data.history.map((h) => (
                <li key={h.id} className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {(h.fromStatus ?? "—") + " → " + h.toStatus}
                    </p>
                    <p className="text-xs text-neutral-500">
                      by {h.changedBy}
                      {h.reason ? ` · ${h.reason}` : ""}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-neutral-500">
                    {formatIst(h.changedAt)} IST
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {showStatusConfirm && selectedNext ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-md bg-white p-5 shadow-lg">
              <h4 className="text-base font-semibold text-neutral-900">
                Move order to {selectedNext}?
              </h4>
              <p className="mt-1 text-sm text-neutral-600">
                The customer will be notified by email and SMS.
                {note.trim() ? ` Note: "${note.trim()}"` : ""}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusConfirm(false)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={updateState.isLoading}
                  onClick={handleUpdate}
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {updateState.isLoading ? "Updating…" : "Confirm update"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showCancel ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-md bg-white p-5 shadow-lg">
              <h4 className="text-base font-semibold text-neutral-900">Cancel this order?</h4>
              <p className="mt-1 text-sm text-neutral-600">
                Customer will be notified of the cancellation and the reason.
              </p>
              <label className="mt-3 block text-sm font-medium text-neutral-700">
                Reason (required)
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Why is this order being cancelled?"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancel(false);
                    setCancelReason("");
                  }}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={cancelState.isLoading || !cancelReason.trim()}
                  onClick={handleCancel}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {cancelState.isLoading ? "Cancelling…" : "Cancel order"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}
