import type { ProductStatus } from "../features/catalog/catalog.api";

const STYLES: Record<ProductStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-neutral-200 text-neutral-700",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
        STYLES[status]
      }
    >
      {status}
    </span>
  );
}
