import type { OrderStatus } from "@storm/contracts";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { OrderStatusBadge } from "../features/orders/OrderStatusBadge";
import {
  useCancelAdminOrderMutation,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from "../features/orders/orders.api";
import { formatINR } from "../lib/format";

const inputCls =
  "rounded-md border border-border bg-surface px-3 py-1.5 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

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
      <AdminShell>
        <PageHeader breadcrumbs={[{ label: "Orders", to: "/orders" }]} title="Order" />
        <p className="text-sm text-text-subtle">Loading…</p>
      </AdminShell>
    );
  }
  if (isError || !data) {
    return (
      <AdminShell>
        <PageHeader breadcrumbs={[{ label: "Orders", to: "/orders" }]} title="Order" />
        <p className="text-sm text-danger">Order not found.</p>
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
    <AdminShell>
      <PageHeader
        breadcrumbs={[
          { label: "Orders", to: "/orders" },
          { label: `#${orderId.slice(0, 8)}` },
        ]}
        title={`Order #${orderId.slice(0, 8)}`}
        subtitle={
          <>
            Placed by{" "}
            <Link
              to={`/users/${data.userId}`}
              className="font-medium text-primary hover:underline"
            >
              {data.customerName} ({data.customerEmail})
            </Link>{" "}
            on {formatIst(data.createdAt)} IST · <span className="font-mono text-xs">{orderId}</span>
          </>
        }
        actions={<OrderStatusBadge status={data.status as OrderStatus} />}
      />

      <div className="space-y-4">
        {error && (
          <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Card padding="lg">
          <CardHeader title="Status transition" />
          {nonCancelTransitions.length === 0 ? (
            <p className="text-sm text-text-subtle">
              No further transitions available from this state.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
                Next status
                <select
                  value={selectedNext}
                  onChange={(e) => setSelectedNext(e.target.value as OrderStatus | "")}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {nonCancelTransitions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-1 flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
                Note (optional)
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  className={inputCls}
                />
              </label>
              <Button
                disabled={!selectedNext || updateState.isLoading}
                onClick={() => setShowStatusConfirm(true)}
              >
                {updateState.isLoading ? "Updating…" : "Update status"}
              </Button>
            </div>
          )}
          {canCancel && (
            <div className="mt-4 border-t border-border pt-3">
              <Button variant="danger" onClick={() => setShowCancel(true)}>
                Cancel order
              </Button>
            </div>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader title="Items" />
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
              <tr>
                <th className="py-2">SKU</th>
                <th>Name</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2 font-mono text-xs text-text-muted">{it.sku}</td>
                  <td className="py-2 text-text">{it.name}</td>
                  <td className="py-2 text-right text-text">{it.qty}</td>
                  <td className="py-2 text-right text-text-muted">
                    {formatINR(it.unitPricePaise, data.currency)}
                  </td>
                  <td className="py-2 text-right font-semibold text-text">
                    {formatINR(it.lineTotalPaise, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ml-auto mt-4 grid w-fit grid-cols-2 gap-x-6 gap-y-1 border-t border-border pt-3 text-sm">
            <dt className="text-text-muted">Subtotal</dt>
            <dd className="text-right text-text">{formatINR(data.subtotalPaise, data.currency)}</dd>
            <dt className="text-text-muted">Shipping</dt>
            <dd className="text-right text-text">{formatINR(data.shippingFeePaise, data.currency)}</dd>
            <dt className="font-semibold text-text">Total</dt>
            <dd className="text-right font-semibold text-text">
              {formatINR(data.totalPaise, data.currency)}
            </dd>
          </dl>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card padding="lg">
            <CardHeader title="Delivery address" />
            <p className="text-sm text-text">
              <span className="font-medium">{data.address.fullName}</span>
              <br />
              {data.address.line1}
              {data.address.line2 ? `, ${data.address.line2}` : ""}
              <br />
              {data.address.city}, {data.address.state} {data.address.pincode}
              <br />
              <span className="text-text-subtle">{data.address.phone}</span>
            </p>
          </Card>

          <Card padding="lg">
            <CardHeader title="Payment" />
            {data.payment ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-text-muted">Provider</dt>
                <dd className="text-text">Razorpay</dd>
                <dt className="text-text-muted">Order ID</dt>
                <dd className="font-mono text-xs text-text">{data.payment.razorpayOrderId}</dd>
                <dt className="text-text-muted">Payment ID</dt>
                <dd className="font-mono text-xs text-text">{data.payment.razorpayPaymentId ?? "—"}</dd>
                <dt className="text-text-muted">Status</dt>
                <dd className="text-text">{data.payment.status}</dd>
                <dt className="text-text-muted">Amount</dt>
                <dd className="text-text">{formatINR(data.payment.amountPaise, data.payment.currency)}</dd>
                <dt className="text-text-muted">Method</dt>
                <dd className="text-text">{data.payment.method ?? "—"}</dd>
                <dt className="text-text-muted">Captured at</dt>
                <dd className="text-text">{formatIst(data.payment.capturedAt)}</dd>
                {data.payment.failureReason ? (
                  <>
                    <dt className="text-text-muted">Failure</dt>
                    <dd className="text-danger">{data.payment.failureReason}</dd>
                  </>
                ) : null}
              </dl>
            ) : (
              <p className="text-sm text-text-subtle">No payment record found.</p>
            )}
          </Card>
        </div>

        <Card padding="lg">
          <CardHeader title="Inventory reservations" />
          {data.reservations.length === 0 ? (
            <p className="text-sm text-text-subtle">No reservation records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
                <tr>
                  <th className="py-2">SKU</th>
                  <th className="text-right">Qty</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.reservations.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 font-mono text-xs text-text-muted">{r.sku}</td>
                    <td className="py-2 text-right text-text">{r.qty}</td>
                    <td className="py-2 text-text">{r.status}</td>
                    <td className="py-2 text-xs text-text-subtle">{formatIst(r.createdAt)}</td>
                    <td className="py-2 text-xs text-text-subtle">{formatIst(r.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader title="Audit trail" />
          {data.history.length === 0 ? (
            <p className="text-sm text-text-subtle">No history recorded.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {data.history.map((h) => (
                <li key={h.id} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-text">
                      {(h.fromStatus ?? "—") + " → " + h.toStatus}
                    </p>
                    <p className="text-xs text-text-subtle">
                      by {h.changedBy}
                      {h.reason ? ` · ${h.reason}` : ""}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-text-subtle">
                    {formatIst(h.changedAt)} IST
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {showStatusConfirm && selectedNext ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/40 p-4">
            <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-elevated">
              <h4 className="text-base font-semibold text-text">
                Move order to {selectedNext}?
              </h4>
              <p className="mt-1 text-sm text-text-muted">
                The customer will be notified by email and SMS.
                {note.trim() ? ` Note: "${note.trim()}"` : ""}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowStatusConfirm(false)}>
                  Back
                </Button>
                <Button disabled={updateState.isLoading} onClick={handleUpdate}>
                  {updateState.isLoading ? "Updating…" : "Confirm update"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {showCancel ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/40 p-4">
            <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-elevated">
              <h4 className="text-base font-semibold text-text">Cancel this order?</h4>
              <p className="mt-1 text-sm text-text-muted">
                Customer will be notified of the cancellation and the reason.
              </p>
              <label className="mt-3 block text-sm font-medium text-text">
                Reason (required)
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="Why is this order being cancelled?"
                />
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancel(false);
                    setCancelReason("");
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="danger"
                  disabled={cancelState.isLoading || !cancelReason.trim()}
                  onClick={handleCancel}
                >
                  {cancelState.isLoading ? "Cancelling…" : "Cancel order"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
