"use client";

import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "../../components/domain/EmptyState";
import { Card, CardHeader } from "../../components/ui/Card";
import { ProductImage } from "../../components/ui/ProductImage";
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
    return (
      <div className="space-y-10">
        <EmptyState
          title="Your cart is empty"
          description="Add items to get started — log in any time to save them."
          ctaLabel="Browse products"
          ctaHref="/"
        />
        <PopularRecsWidget />
      </div>
    );
  }
  const subtotal = items.reduce((acc, i) => acc + i.basePrice * i.qty, 0);
  const itemCount = items.reduce((a, i) => a + i.qty, 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={`${item.productId}:${item.variantId ?? "_"}`} padding="md">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/p/${item.slug}`}
                className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted"
              >
                <ProductImage
                  src={item.primaryImageUrl}
                  alt={item.name}
                  seed={item.slug}
                  className="h-full w-full object-contain p-1"
                />
              </Link>
              <div className="flex-1">
                <Link
                  href={`/p/${item.slug}`}
                  className="block text-sm font-semibold text-text hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-semibold text-text">
                  {formatINR(item.basePrice, "INR")}
                </p>
                <div className="mt-3 flex items-center gap-2">
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
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-text-muted transition hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-text">
                  {formatINR(item.basePrice * item.qty, "INR")}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card padding="lg">
          <CardHeader title="Price details" description={`${itemCount} item${itemCount === 1 ? "" : "s"}`} />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Total MRP</dt>
              <dd className="text-text">{formatINR(subtotal, "INR")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Delivery charges</dt>
              <dd className="font-semibold text-success">FREE</dd>
            </div>
            <div className="flex justify-between border-t border-dashed border-border pt-3 text-base font-bold">
              <dt className="text-text">Total amount</dt>
              <dd className="text-text">{formatINR(subtotal, "INR")}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs font-semibold text-warning-foreground">
            Log in to verify availability and proceed to checkout.
          </div>
          <Link
            href="/auth/login?returnTo=/cart"
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-base font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover"
          >
            Log in to checkout
          </Link>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="h-4 w-4 text-success" />
            Safe & secure payments
          </p>
        </Card>
      </aside>
    </div>
  );
}

function QtyStepper(props: { qty: number; onChange: (q: number) => void }) {
  return (
    <div className="inline-flex h-9 items-center rounded-md border border-border bg-surface">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => props.onChange(Math.max(1, props.qty - 1))}
        className="inline-flex h-full w-9 items-center justify-center text-text hover:bg-surface-muted disabled:opacity-40"
        disabled={props.qty <= 1}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-9 text-center text-sm font-semibold text-text">{props.qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => props.onChange(Math.min(10, props.qty + 1))}
        className="inline-flex h-full w-9 items-center justify-center text-text hover:bg-surface-muted disabled:opacity-40"
        disabled={props.qty >= 10}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
