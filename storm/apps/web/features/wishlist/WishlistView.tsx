"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "../../components/domain/EmptyState";
import { Button } from "../../components/ui/Button";
import { PriceBlock } from "../../components/ui/PriceBlock";
import { ProductImage } from "../../components/ui/ProductImage";
import { ProductGridSkeleton } from "../../components/ui/Skeletons";
import { toast } from "../../lib/toast";
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
    return <ProductGridSkeleton count={6} />;
  }
  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No wishlist items yet"
        description="Save items you love and find them here later."
        ctaLabel="Browse products"
        ctaHref="/"
        icon={<Heart className="h-8 w-8" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {data.items.map((item) => (
        <article
          key={item.sku}
          className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <Link href={`/p/${item.slug}`} className="block">
            <div className="aspect-square overflow-hidden bg-surface-muted">
              <ProductImage
                src={null}
                alt={item.name}
                className="h-full w-full object-contain p-3 transition-transform group-hover:scale-[1.03]"
              />
            </div>
          </Link>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <Link
              href={`/p/${item.slug}`}
              className="line-clamp-2 min-h-[2.5em] text-sm font-medium text-text hover:text-primary"
            >
              {item.name}
            </Link>
            <PriceBlock
              price={item.currentPrice}
              currency={item.currency}
              size="sm"
            />
            {!item.available ? (
              <p className="text-[11px] font-semibold text-danger">Out of stock</p>
            ) : null}
            <div className="mt-auto flex gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                leadingIcon={<ShoppingCart className="h-3.5 w-3.5" />}
                disabled={!item.available}
                onClick={async () => {
                  try {
                    await moveToCart({ sku: item.sku }).unwrap();
                    toast.success("Moved to cart");
                  } catch {
                    toast.error("Could not move to cart");
                  }
                }}
              >
                Cart
              </Button>
              <button
                type="button"
                aria-label="Remove from wishlist"
                onClick={async () => {
                  try {
                    await removeItem({ sku: item.sku }).unwrap();
                    toast.show("Removed from wishlist");
                  } catch {
                    toast.error("Could not remove");
                  }
                }}
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border text-text-subtle transition hover:border-danger/40 hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
