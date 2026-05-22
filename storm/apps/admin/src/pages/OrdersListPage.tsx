import type { OrderStatus, OrderSummary } from "@storm/contracts";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ExportButton } from "../components/ExportButton";
import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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

const inputCls =
  "rounded-md border border-border bg-surface px-3 py-1.5 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

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

  const exportFilters: Record<string, string> = {};
  if (status) exportFilters["status"] = status;
  if (q.trim()) exportFilters["q"] = q.trim();
  const fromIso = toIso(from);
  if (fromIso) exportFilters["from"] = fromIso;
  const toIsoVal = toIso(to);
  if (toIsoVal) exportFilters["to"] = toIsoVal;

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Orders" }]}
        title="Orders"
        subtitle="All customer orders across statuses."
        actions={<ExportButton kind="orders" filters={exportFilters} />}
      />

      <Card padding="md" className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
            Search
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
                aria-hidden
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Order ID or customer email"
                className="block w-full rounded-md border border-border bg-surface py-1.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputCls}
            />
          </label>
          <Button onClick={applyFilter}>Apply</Button>
        </div>
      </Card>

      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          Failed to load orders.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isFetching && accumulated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-text-subtle">
                  Loading…
                </td>
              </tr>
            )}
            {accumulated.map((order) => (
              <tr key={order.id} className="transition hover:bg-surface-muted">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-primary hover:underline"
                  >
                    {order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text">{order.customerEmail ?? "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-text">
                  {formatINR(order.totalPaise, order.currency)}
                </td>
                <td className="px-4 py-3 text-right text-text-muted">{order.itemsCount}</td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </td>
                <td className="px-4 py-3 text-xs text-text-subtle">
                  {formatIst(order.createdAt)}
                </td>
                <td className="px-4 py-3 text-xs text-text-subtle">
                  {order.updatedAt ? formatIst(order.updatedAt) : "—"}
                </td>
              </tr>
            ))}
            {!isFetching && accumulated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-text-subtle">
                  No orders match the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.nextCursor ? (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={loadMore} disabled={isFetching}>
            {isFetching ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </AdminShell>
  );
}
