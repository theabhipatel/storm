import type { OrderStatus } from "@storm/contracts";

import { Badge } from "../../components/ui/Badge";

type Variant =
  | "soft-warning"
  | "soft-success"
  | "soft-primary"
  | "soft-danger"
  | "neutral";

const VARIANTS: Record<OrderStatus, Variant> = {
  pending_payment: "soft-warning",
  confirmed: "soft-success",
  processing: "soft-primary",
  shipped: "soft-primary",
  delivered: "soft-success",
  cancelled: "neutral",
  failed: "soft-danger",
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
    <Badge variant={VARIANTS[status]} size="sm" className="rounded-full px-2">
      {LABELS[status]}
    </Badge>
  );
}
