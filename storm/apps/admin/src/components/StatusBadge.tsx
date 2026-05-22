import type { ProductStatus } from "../features/catalog/catalog.api";
import { Badge } from "./ui/Badge";

const VARIANT_MAP: Record<ProductStatus, "soft-warning" | "soft-success" | "neutral"> = {
  draft: "soft-warning",
  published: "soft-success",
  archived: "neutral",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant={VARIANT_MAP[status]} size="sm" className="rounded-full px-2 capitalize">
      {status}
    </Badge>
  );
}
