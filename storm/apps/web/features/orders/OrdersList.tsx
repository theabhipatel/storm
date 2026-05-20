"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { OrderStatus, OrderSummary } from "@storm/contracts";

import { formatINR } from "../../lib/format";
import { useListOrdersQuery } from "./orders.api";
import { OrderStatusBadge } from "./OrderStatusBadge";

type FilterKey = "all" | "active" | "delivered" | "cancelled";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES = new Set<OrderStatus>([
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
]);

function matchesFilter(filter: FilterKey, status: OrderStatus): boolean {
  if (filter === "all") return true;
  if (filter === "active") return ACTIVE_STATUSES.has(status);
  if (filter === "delivered") return status === "delivered";
  return status === "cancelled" || status === "failed";
}

export function OrdersList() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pages, setPages] = useState<OrderSummary[][]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching } = useListOrdersQuery(
    cursor ? { cursor } : undefined,
  );

  const accumulated = useMemo(() => {
    if (!data) return pages.flat();
    const allPages = cursor ? [...pages, data.items] : [data.items];
    return allPages.flat();
  }, [data, pages, cursor]);

  const filtered = useMemo(
    () => accumulated.filter((o) => matchesFilter(filter, o.status as OrderStatus)),
    [accumulated, filter],
  );

  function loadMore(): void {
    if (!data?.nextCursor) return;
    setPages((prev) => [...prev, data.items]);
    setCursor(data.nextCursor);
  }

  if (isLoading) {
    return <p className="py-10 text-center text-neutral-500">Loading your orders…</p>;
  }
  if (accumulated.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-neutral-700">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium " +
              (filter === f.key
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No orders match this filter.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <li
              key={order.id}
              className="flex items-start justify-between rounded-md border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                {order.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.thumbnailUrl}
                    alt=""
                    className="h-14 w-14 rounded object-cover"
                  />
                ) : null}
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">
                    {order.firstItemName ?? "Order"} · {order.itemsCount} item
                    {order.itemsCount === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900">
                  {formatINR(order.totalPaise, order.currency)}
                </p>
                <Link
                  href={`/orders/${order.id}`}
                  className="mt-2 inline-block text-sm text-neutral-700 underline-offset-2 hover:underline"
                >
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

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
    </div>
  );
}
