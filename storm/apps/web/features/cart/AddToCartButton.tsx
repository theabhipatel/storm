"use client";

import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "../../components/ui/Button";
import { toast } from "../../lib/toast";
import { useCurrentUser } from "../auth/auth.hooks";
import { useAddWishlistItemMutation } from "../wishlist/wishlist.api";
import { anonCart } from "./anonCart";
import { useAddCartItemMutation } from "./cart.api";

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
  const router = useRouter();
  const user = useCurrentUser();
  const [addCartItem, { isLoading: addingToCart }] = useAddCartItemMutation();
  const [addWishlistItem] = useAddWishlistItemMutation();
  const [qty, setQty] = useState<number>(props.initialQty ?? 1);

  const inStock = props.inStock ?? true;

  async function performAdd(): Promise<boolean> {
    if (user) {
      try {
        await addCartItem({
          productId: props.productId,
          ...(props.variantId !== undefined ? { variantId: props.variantId } : {}),
          qty,
        }).unwrap();
        return true;
      } catch {
        toast.error("Could not add to cart");
        return false;
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
      return true;
    }
  }

  async function handleAddToCart(): Promise<void> {
    const ok = await performAdd();
    if (ok) toast.success("Added to cart");
  }

  async function handleBuyNow(): Promise<void> {
    const ok = await performAdd();
    if (ok) router.push("/cart");
  }

  async function handleAddToWishlist(): Promise<void> {
    if (!user) {
      window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    try {
      await addWishlistItem({ sku: props.sku }).unwrap();
      toast.success("Added to wishlist");
    } catch {
      toast.error("Could not add to wishlist");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text">Qty</span>
        <div className="inline-flex h-10 items-center rounded-md border border-border bg-surface">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
            disabled={!inStock || qty <= 1}
            className="inline-flex h-full w-9 items-center justify-center text-text hover:bg-surface-muted disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-text">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((n) => Math.min(10, n + 1))}
            disabled={!inStock || qty >= 10}
            className="inline-flex h-full w-9 items-center justify-center text-text hover:bg-surface-muted disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAddToWishlist}
          aria-label="Add to wishlist"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-subtle transition hover:border-danger/40 hover:text-danger"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          leadingIcon={<ShoppingCart className="h-4 w-4" />}
          fullWidth
        >
          {inStock ? "Add to cart" : "Out of stock"}
        </Button>
        <Button
          variant="accent"
          size="lg"
          onClick={handleBuyNow}
          disabled={!inStock || addingToCart}
          leadingIcon={<Zap className="h-4 w-4" />}
          fullWidth
        >
          Buy now
        </Button>
      </div>
    </div>
  );
}
