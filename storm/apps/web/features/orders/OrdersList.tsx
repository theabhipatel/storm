"use client";

import Link from "next/link";

import { formatINR } from "../../lib/format";
import { useListOrdersQuery } from "./orders.api";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function OrdersList() {
  const { data, isLoading } = useListOrdersQuery();
  if (isLoading) {
    return <p className="py-10 text-center text-neutral-500">Loading your orders…</p>;
  }
  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-neutral-700">You haven't placed any orders yet.</p>
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
    <ul className="space-y-3">
      {data.items.map((order) => (
        <li
          key={order.id}
          className="flex items-start justify-between rounded-md border border-neutral-200 bg-white p-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/orders/${order.id}`}
                className="font-medium text-neutral-900 hover:underline"
              >
                #{order.id.slice(0, 8)}
              </Link>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-neutral-700">
              {order.firstItemName ?? "Order"} · {order.itemsCount} item
              {order.itemsCount === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-neutral-500">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>
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
  );
}
