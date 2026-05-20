"use client";

import Link from "next/link";

import { EmptyState } from "../../components/domain/EmptyState";
import { CartSkeleton } from "../../components/ui/Skeletons";
import { formatINR } from "../../lib/format";
import { toast } from "../../lib/toast";
import type { Cart, CartItem } from "@storm/contracts";
import { PopularRecsWidget } from "../recs/PopularRecsWidget";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "./cart.api";

export function CartView() {
  const { data, isLoading, isFetching } = useGetCartQuery();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();

  if (isLoading) {
    return <CartSkeleton />;
  }
  if (!data || data.items.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          ctaLabel="Browse products"
          ctaHref="/"
        />
        <PopularRecsWidget />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {data.items.map((item) => (
          <CartItemRow
            key={item.sku}
            item={item}
            onQty={async (qty) => {
              try {
                await updateItem({ sku: item.sku, body: { qty } }).unwrap();
              } catch {
                toast.error("Could not update quantity");
              }
            }}
            onRemove={async () => {
              try {
                await removeItem({ sku: item.sku }).unwrap();
                toast.show("Removed from cart");
              } catch {
                toast.error("Could not remove item");
              }
            }}
            disabled={isFetching}
          />
        ))}
      </div>
      <CartSummary cart={data} />
    </div>
  );
}

function CartItemRow(props: {
  item: CartItem;
  onQty: (q: number) => Promise<void>;
  onRemove: () => Promise<void>;
  disabled: boolean;
}) {
  const { item } = props;
  const lineTotal = item.currentPrice * item.qty;
  return (
    <article className="flex gap-4 rounded-md border border-neutral-200 bg-white p-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-neutral-100" />
      <div className="flex-1">
        <Link
          href={`/p/${item.slug}`}
          className="font-medium text-neutral-900 hover:underline"
        >
          {item.name}
        </Link>

        <p className="mt-1 text-sm text-neutral-700">
          {formatINR(item.currentPrice, item.currency)}
          {item.priceChanged && (
            <span className="ml-2 text-xs text-amber-700">
              Price updated from {formatINR(item.priceSnapshot, item.currency)}
            </span>
          )}
        </p>

        {!item.available && (
          <p className="mt-1 text-xs text-red-600">
            Out of stock — remove or save for later.
          </p>
        )}

        <div className="mt-2 flex items-center gap-3">
          <div className="inline-flex items-center rounded-md border border-neutral-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={props.disabled || item.qty <= 1 || !item.available}
              onClick={() => props.onQty(Math.max(1, item.qty - 1))}
              className="px-2 py-1 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              −
            </button>
            <span className="min-w-[28px] text-center text-sm">{item.qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={props.disabled || item.qty >= 10 || !item.available}
              onClick={() => props.onQty(Math.min(10, item.qty + 1))}
              className="px-2 py-1 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => void props.onRemove()}
            className="text-xs text-neutral-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <span className="text-sm font-semibold text-neutral-900">
          {formatINR(lineTotal, item.currency)}
        </span>
      </div>
    </article>
  );
}

function CartSummary({ cart }: { cart: Cart }) {
  const hasUnavailable = cart.items.some((i) => !i.available);
  return (
    <aside className="h-fit space-y-3 rounded-md border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-neutral-900">Order summary</h2>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-600">Items ({cart.itemCount})</dt>
          <dd className="text-neutral-900">{formatINR(cart.subtotalPaise, cart.currency)}</dd>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-2">
          <dt className="font-semibold text-neutral-900">Subtotal</dt>
          <dd className="font-semibold text-neutral-900">
            {formatINR(cart.subtotalPaise, cart.currency)}
          </dd>
        </div>
      </dl>
      {hasUnavailable && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Some items are out of stock. Remove them to proceed.
        </p>
      )}
      <Link
        href="/checkout"
        aria-disabled={hasUnavailable || cart.items.length === 0}
        className={
          "block w-full rounded-md px-4 py-2 text-center text-sm font-semibold text-white " +
          (hasUnavailable || cart.items.length === 0
            ? "pointer-events-none bg-neutral-900 opacity-60"
            : "bg-neutral-900 hover:bg-neutral-800")
        }
      >
        Proceed to checkout
      </Link>
    </aside>
  );
}
