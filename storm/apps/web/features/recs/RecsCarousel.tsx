"use client";

import Link from "next/link";

import { PriceBlock } from "../../components/ui/PriceBlock";
import { ProductImage } from "../../components/ui/ProductImage";
import { Rail } from "../../components/ui/Rail";
import type { RecommendedProduct } from "@storm/contracts";

export function RecsCarousel(props: {
  title: string;
  items: RecommendedProduct[];
  loading?: boolean;
}) {
  if (props.loading) {
    return (
      <section className="overflow-hidden rounded-lg bg-surface shadow-card">
        <div className="px-4 pb-3 pt-4 sm:px-6">
          <h2 className="text-lg font-semibold text-text">{props.title}</h2>
        </div>
        <div className="flex gap-3 px-4 pb-4 sm:px-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="w-44 flex-shrink-0 animate-pulse space-y-2 rounded-lg border border-border bg-surface-muted p-3"
            >
              <div className="aspect-square w-full rounded bg-surface-strong" />
              <div className="h-3 w-3/4 rounded bg-surface-strong" />
              <div className="h-3 w-1/2 rounded bg-surface-strong" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (props.items.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-lg shadow-card">
      <Rail title={props.title}>
        {props.items.map((item) => (
          <article
            key={item.productId}
            className="group flex w-44 flex-shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:-translate-y-0.5 hover:shadow-card-hover sm:w-52"
          >
            <Link href={`/p/${item.slug}`} className="flex h-full flex-col">
              <div className="aspect-square overflow-hidden bg-surface-muted">
                <ProductImage
                  src={item.primaryImageUrl}
                  alt={item.name}
                  className="h-full w-full object-contain p-2 transition-transform group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                {item.brandName ? (
                  <p className="truncate text-[11px] font-medium uppercase tracking-wide text-text-subtle">
                    {item.brandName}
                  </p>
                ) : null}
                <p className="line-clamp-2 min-h-[2.5em] text-sm font-medium text-text">
                  {item.name}
                </p>
                <div className="mt-auto pt-1">
                  <PriceBlock
                    price={item.basePrice}
                    currency={item.currency}
                    size="sm"
                  />
                </div>
                {!item.inStock ? (
                  <p className="text-[11px] font-semibold text-danger">Out of stock</p>
                ) : null}
              </div>
            </Link>
          </article>
        ))}
      </Rail>
    </div>
  );
}
