"use client";

import Link from "next/link";

import { formatINR } from "../../lib/format";
import {
  useGetWishlistQuery,
  useMoveToCartMutation,
  useRemoveWishlistItemMutation,
} from "./wishlist.api";

export function WishlistView() {
  const { data, isLoading } = useGetWishlistQuery();
  const [moveToCart] = useMoveToCartMutation();
  const [removeItem] = useRemoveWishlistItemMutation();

  if (isLoading) {
    return <p className="py-12 text-center text-neutral-500">Loading…</p>;
  }
  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-neutral-700">Your wishlist is empty.</p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.items.map((item) => (
        <article
          key={item.sku}
          className="flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4"
        >
          <div className="h-40 w-full overflow-hidden rounded bg-neutral-100" />
          <div>
            <Link
              href={`/p/${item.slug}`}
              className="font-medium text-neutral-900 hover:underline"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-neutral-700">
              {formatINR(item.currentPrice, item.currency)}
            </p>
            {!item.available && (
              <p className="mt-1 text-xs text-red-600">Out of stock</p>
            )}
          </div>
          <div className="mt-auto flex gap-2">
            <button
              type="button"
              disabled={!item.available}
              onClick={() => moveToCart({ sku: item.sku })}
              className="flex-1 rounded-md bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Move to cart
            </button>
            <button
              type="button"
              onClick={() => removeItem({ sku: item.sku })}
              className="rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
