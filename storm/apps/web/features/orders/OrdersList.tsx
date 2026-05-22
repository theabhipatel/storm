"use client";

import { ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { OrderStatus, OrderSummary } from "@storm/contracts";

import { EmptyState } from "../../components/domain/EmptyState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { OrderListSkeleton } from "../../components/ui/Skeletons";
import { formatDateShortIST, formatINR } from "../../lib/format";
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
    return <OrderListSkeleton />;
  }
  if (accumulated.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it'll show up here."
        ctaLabel="Start shopping"
        ctaHref="/"
        icon={<ShoppingBag className="h-8 w-8" />}
      />
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
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-text hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-text-muted">
          No orders match this filter.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <li key={order.id}>
              <Card padding="md" hoverable>
                <div className="flex items-start gap-4">
                  <Link
                    href={`/orders/${order.id}`}
                    className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted"
                  >
                    {order.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-contain p-1"
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-semibold text-text hover:text-primary"
                      >
                        Order #{order.id.slice(0, 8)}
                      </Link>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </div>
                    <p className="mt-1 truncate text-sm text-text-muted">
                      {order.firstItemName ?? "Order"} · {order.itemsCount} item
                      {order.itemsCount === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs text-text-subtle">
                      Placed on {formatDateShortIST(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-base font-bold text-text">
                      {formatINR(order.totalPaise, order.currency)}
                    </p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {data?.nextCursor ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isFetching}>
            {isFetching ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
