"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { formatINR } from "../../lib/format";
import { PopularRecsWidget } from "../recs/PopularRecsWidget";
import { anonCart, type AnonCartItem } from "./anonCart";

export function AnonCartView() {
  const [items, setItems] = useState<AnonCartItem[]>(() => anonCart.get().items);

  useEffect(() => {
    const unsub = anonCart.onChange(() => setItems(anonCart.get().items));
    return unsub;
  }, []);

  if (items.length === 0) {
    return <EmptyCart />;
  }
  const subtotal = items.reduce((acc, i) => acc + i.basePrice * i.qty, 0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={`${item.productId}:${item.variantId ?? "_"}`}
            className="flex gap-4 rounded-md border border-neutral-200 bg-white p-4"
          >
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
              {item.primaryImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.primaryImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link
                href={`/p/${item.slug}`}
                className="font-medium text-neutral-900 hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-neutral-500">
                {formatINR(item.basePrice, "INR")}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <QtyStepper
                  qty={item.qty}
                  onChange={(next) =>
                    setItems(
                      anonCart.updateQty(item.productId, item.variantId, next).items,
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setItems(anonCart.remove(item.productId, item.variantId).items)
                  }
                  className="text-xs text-neutral-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className="text-sm font-semibold text-neutral-900">
                {formatINR(item.basePrice * item.qty, "INR")}
              </span>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-md border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Order summary</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Items ({items.reduce((a, i) => a + i.qty, 0)})</dt>
            <dd className="text-neutral-900">{formatINR(subtotal, "INR")}</dd>
          </div>
        </dl>
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Log in to verify availability and proceed to checkout.
        </p>
        <Link
          href="/auth/login?returnTo=/cart"
          className="mt-3 block w-full rounded-md bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Log in to checkout
        </Link>
      </aside>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="space-y-8">
      <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-neutral-700">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Browse products
        </Link>
      </div>
      <PopularRecsWidget />
    </div>
  );
}

function QtyStepper(props: { qty: number; onChange: (q: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border border-neutral-300">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => props.onChange(Math.max(1, props.qty - 1))}
        className="px-2 py-1 text-neutral-700 hover:bg-neutral-50"
      >
        −
      </button>
      <span className="min-w-[28px] text-center text-sm">{props.qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => props.onChange(Math.min(10, props.qty + 1))}
        className="px-2 py-1 text-neutral-700 hover:bg-neutral-50"
      >
        +
      </button>
    </div>
  );
}
