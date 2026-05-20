import type { OrderStatus } from "@storm/contracts";

const STYLES: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  processing: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-neutral-200 text-neutral-700",
  failed: "bg-red-100 text-red-800",
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
      className={
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium " + STYLES[status]
      }
    >
      {LABELS[status]}
    </span>
  );
}
