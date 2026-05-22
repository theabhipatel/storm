import { formatINR } from "../../lib/format";

interface PriceBlockProps {
  price: number;
  mrp?: number | null | undefined;
  currency?: string | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "start" | "end";
  hideDiscountWhenSame?: boolean;
}

const SIZE_PRICE: Record<NonNullable<PriceBlockProps["size"]>, string> = {
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-xl font-bold",
  xl: "text-3xl font-bold",
};

const SIZE_MRP: Record<NonNullable<PriceBlockProps["size"]>, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base",
};

export function PriceBlock({
  price,
  mrp,
  currency = "INR",
  size = "md",
  align = "start",
  hideDiscountWhenSame = true,
}: PriceBlockProps) {
  const hasDiscount =
    typeof mrp === "number" && mrp > price && !(hideDiscountWhenSame && mrp === price);
  const discountPct = hasDiscount && mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${
        align === "end" ? "justify-end" : ""
      }`}
    >
      <span className={`${SIZE_PRICE[size]} text-text`}>
        {formatINR(price, currency)}
      </span>
      {hasDiscount && mrp ? (
        <>
          <span className={`${SIZE_MRP[size]} text-text-subtle line-through`}>
            {formatINR(mrp, currency)}
          </span>
          {discountPct > 0 ? (
            <span className={`${SIZE_MRP[size]} font-semibold text-success`}>
              {discountPct}% off
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
