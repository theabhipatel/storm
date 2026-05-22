import type { OrderStatus } from "@storm/contracts";

const STYLES: Record<OrderStatus, string> = {
  pending_payment: "bg-warning-soft text-warning-foreground",
  confirmed: "bg-primary-soft text-primary",
  processing: "bg-primary-soft text-primary",
  shipped: "bg-accent/15 text-accent",
  delivered: "bg-success-soft text-success",
  cancelled: "bg-surface-strong text-text-muted",
  failed: "bg-danger-soft text-danger",
};

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
