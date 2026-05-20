"use client";

import { useState } from "react";

import { useCurrentUser } from "../auth/auth.hooks";
import { useAddCartItemMutation } from "./cart.api";
import { useAddWishlistItemMutation } from "../wishlist/wishlist.api";
import { anonCart } from "./anonCart";

export interface AddToCartButtonProps {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  basePrice: number;
  primaryImageUrl?: string | undefined;
  variantId?: string | undefined;
  initialQty?: number;
  inStock?: boolean;
}

export function AddToCartButton(props: AddToCartButtonProps) {
  const user = useCurrentUser();
  const [addCartItem, { isLoading: addingToCart }] = useAddCartItemMutation();
  const [addWishlistItem] = useAddWishlistItemMutation();
  const [qty, setQty] = useState<number>(props.initialQty ?? 1);
  const [toast, setToast] = useState<string | null>(null);

  const inStock = props.inStock ?? true;

  async function handleAddToCart(): Promise<void> {
    if (user) {
      try {
        await addCartItem({
          productId: props.productId,
          ...(props.variantId !== undefined ? { variantId: props.variantId } : {}),
          qty,
        }).unwrap();
        setToast("Added to cart");
      } catch {
        setToast("Could not add to cart");
      }
    } else {
      anonCart.addItem({
        productId: props.productId,
        sku: props.sku,
        ...(props.variantId !== undefined ? { variantId: props.variantId } : {}),
        qty,
        name: props.name,
        slug: props.slug,
        ...(props.primaryImageUrl !== undefined
          ? { primaryImageUrl: props.primaryImageUrl }
          : {}),
        basePrice: props.basePrice,
        currency: "INR",
      });
      setToast("Added to cart");
    }
    setTimeout(() => setToast(null), 2200);
  }

  async function handleAddToWishlist(): Promise<void> {
    if (!user) {
      window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    try {
      await addWishlistItem({ sku: props.sku }).unwrap();
      setToast("Added to wishlist");
    } catch {
      setToast("Could not add to wishlist");
    }
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm text-neutral-700">
          Qty
        </label>
        <select
          id="qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          disabled={!inStock}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm disabled:opacity-50"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          className="flex-1 rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          title={inStock ? "Add to cart" : "Out of stock"}
        >
          {inStock ? "Add to cart" : "Notify when back (Stage 2)"}
        </button>
        <button
          type="button"
          onClick={handleAddToWishlist}
          aria-label="Add to wishlist"
          title="Add to wishlist"
          className="rounded-md border border-neutral-300 px-4 py-3 text-sm hover:bg-neutral-50"
        >
          ♥
        </button>
      </div>
      {toast && (
        <p
          role="status"
          className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-800"
        >
          {toast}
        </p>
      )}
    </div>
  );
}
