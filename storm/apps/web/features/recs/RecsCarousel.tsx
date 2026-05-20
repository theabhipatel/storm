"use client";

import Link from "next/link";

import { formatINR } from "../../lib/format";
import type { RecommendedProduct } from "@storm/contracts";

export function RecsCarousel(props: {
  title: string;
  items: RecommendedProduct[];
  loading?: boolean;
}) {
  if (props.loading) {
    return (
      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-900">{props.title}</h2>
        <div className="rounded-md border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
          Loading recommendations…
        </div>
      </section>
    );
  }
  if (props.items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-neutral-900">{props.title}</h2>
      <ul className="flex gap-3 overflow-x-auto pb-2">
        {props.items.map((item) => (
          <li
            key={item.productId}
            className="w-44 flex-shrink-0 rounded-md border border-neutral-200 bg-white p-3"
          >
            <Link href={`/p/${item.slug}`} className="block">
              <div className="h-32 w-full overflow-hidden rounded bg-neutral-100" />
              <p className="mt-2 truncate text-sm font-medium text-neutral-900">
                {item.name}
              </p>
              <p className="text-xs text-neutral-700">
                {formatINR(item.basePrice, item.currency)}
              </p>
              {!item.inStock && (
                <p className="mt-1 text-xs text-red-600">Out of stock</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
