"use client";

import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "../../components/domain/EmptyState";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
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
      <div className="space-y-10">
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
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
    <Card padding="md">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/p/${item.slug}`}
          className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted"
        >
          <div className="h-full w-full bg-surface-strong" />
        </Link>
        <div className="flex-1">
          <Link
            href={`/p/${item.slug}`}
            className="block text-sm font-semibold text-text hover:text-primary"
          >
            {item.name}
          </Link>
          <p className="mt-1 text-sm font-semibold text-text">
            {formatINR(item.currentPrice, item.currency)}
          </p>
          {item.priceChanged ? (
            <p className="mt-1 text-xs text-warning-foreground">
              Price updated from {formatINR(item.priceSnapshot, item.currency)}
            </p>
          ) : null}
          {!item.available ? (
            <p className="mt-1 text-xs font-semibold text-danger">
              Out of stock — remove to proceed
            </p>
          ) : null}
          <div className="mt-3 flex items-center gap-2">
            <div className="inline-flex h-9 items-center rounded-md border border-border bg-surface">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={props.disabled || item.qty <= 1 || !item.available}
                onClick={() => props.onQty(Math.max(1, item.qty - 1))}
                className="inline-flex h-full w-9 items-center justify-center text-text hover:bg-surface-muted disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-9 text-center text-sm font-semibold text-text">
                {item.qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={props.disabled || item.qty >= 10 || !item.available}
                onClick={() => props.onQty(Math.min(10, item.qty + 1))}
                className="inline-flex h-full w-9 items-center justify-center text-text hover:bg-surface-muted disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void props.onRemove()}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-text-muted transition hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-text">
            {formatINR(lineTotal, item.currency)}
          </p>
        </div>
      </div>
    </Card>
  );
}

function CartSummary({ cart }: { cart: Cart }) {
  const hasUnavailable = cart.items.some((i) => !i.available);
  const disabled = hasUnavailable || cart.items.length === 0;
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <Card padding="lg">
        <CardHeader title="Price details" description={`${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"}`} />
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Total MRP</dt>
            <dd className="text-text">{formatINR(cart.subtotalPaise, cart.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Delivery charges</dt>
            <dd className="font-semibold text-success">FREE</dd>
          </div>
          <div className="flex justify-between border-t border-dashed border-border pt-3 text-base font-bold">
            <dt className="text-text">Total amount</dt>
            <dd className="text-text">{formatINR(cart.subtotalPaise, cart.currency)}</dd>
          </div>
        </dl>
        {hasUnavailable ? (
          <p className="mt-4 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs font-semibold text-warning-foreground">
            Some items are out of stock. Remove them to proceed.
          </p>
        ) : null}
        <div className="mt-5">
          {disabled ? (
            <Button variant="accent" size="lg" fullWidth disabled>
              Place order
            </Button>
          ) : (
            <Link
              href="/checkout"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-base font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover"
            >
              Place order
            </Link>
          )}
        </div>
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="h-4 w-4 text-success" />
          Safe & secure payments
        </p>
      </Card>
    </aside>
  );
}
