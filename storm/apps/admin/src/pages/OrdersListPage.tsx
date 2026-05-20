import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { OrderStatus, OrderSummary } from "@storm/contracts";

import { AdminShell } from "../components/AdminShell";
import { OrderStatusBadge } from "../features/orders/OrderStatusBadge";
import { useListAdminOrdersQuery } from "../features/orders/orders.api";
import { formatINR } from "../lib/format";

const STATUS_OPTIONS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending_payment", label: "Awaiting payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];

function toIso(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function formatIst(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrdersListPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pages, setPages] = useState<OrderSummary[][]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isFetching, error } = useListAdminOrdersQuery({
    status: status || undefined,
    q: q.trim() || undefined,
    from: toIso(from),
    to: toIso(to),
    cursor,
    limit: 20,
  });

  const accumulated = useMemo(() => {
    if (!data) return pages.flat();
    return cursor ? [...pages.flat(), ...data.items] : data.items;
  }, [data, pages, cursor]);

  function applyFilter(): void {
    setPages([]);
    setCursor(undefined);
  }

  function loadMore(): void {
    if (!data?.nextCursor) return;
    setPages((prev) => [...prev, data.items]);
    setCursor(data.nextCursor);
  }

  return (
    <AdminShell title="Orders">
      <section className="space-y-4">
        <h1 className="text-xl font-semibold text-neutral-900">Orders</h1>

        <div className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-200 bg-white p-3">
          <label className="flex flex-col text-xs text-neutral-600">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
              className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col text-xs text-neutral-600">
            Search
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order ID or customer email"
              className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col text-xs text-neutral-600">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col text-xs text-neutral-600">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={applyFilter}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Failed to load orders.
          </p>
        )}

        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Items</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Placed</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isFetching && accumulated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500">
                    Loading…
                  </td>
                </tr>
              )}
              {accumulated.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-neutral-900 hover:underline"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-neutral-800">
                    {order.customerEmail ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {formatINR(order.totalPaise, order.currency)}
                  </td>
                  <td className="px-3 py-2 text-right">{order.itemsCount}</td>
                  <td className="px-3 py-2">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-500">
                    {formatIst(order.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-xs text-neutral-500">
                    {order.updatedAt ? formatIst(order.updatedAt) : "—"}
                  </td>
                </tr>
              ))}
              {!isFetching && accumulated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500">
                    No orders match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.nextCursor ? (
          <div className="text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={isFetching}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 disabled:opacity-50"
            >
              {isFetching ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}
