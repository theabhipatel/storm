"use client";

import { Heart, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SearchHit } from "@storm/contracts";

import { useCurrentUser } from "../../features/auth/auth.hooks";
import { Badge } from "../ui/Badge";
import { PriceBlock } from "../ui/PriceBlock";
import { ProductImage } from "../ui/ProductImage";

interface HitWithExtras extends SearchHit {
  mrp?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export function ProductCard({ hit }: { hit: SearchHit }) {
  const extras = hit as HitWithExtras;
  const hasRating =
    typeof extras.rating === "number" && Number.isFinite(extras.rating);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <WishlistHeart productId={hit.productId} />
      <Link
        href={`/p/${hit.slug}`}
        className="flex h-full flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          <ProductImage
            src={hit.primaryImageUrl}
            alt={hit.name}
            seed={hit.slug}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {!hit.inStock ? (
            <span className="absolute left-2 top-2 z-10">
              <Badge variant="warning" size="sm">
                Out of stock
              </Badge>
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-text-subtle">
            {hit.brandName}
          </p>
          <h3 className="line-clamp-2 min-h-[2.5em] text-sm font-medium text-text">
            {hit.name}
          </h3>
          {hasRating ? (
            <div className="flex items-center gap-1.5">
              <Badge variant="success" size="sm" leadingIcon={<Star className="h-3 w-3 fill-current" />}>
                {(extras.rating ?? 0).toFixed(1)}
              </Badge>
              {typeof extras.reviewCount === "number" ? (
                <span className="text-[11px] font-medium text-text-subtle">
                  ({formatCount(extras.reviewCount)})
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-auto pt-1.5">
            <PriceBlock
              price={hit.basePrice}
              mrp={extras.mrp ?? undefined}
              currency={hit.currency}
              size="md"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function WishlistHeart({ productId }: { productId: string }) {
  const user = useCurrentUser();
  const router = useRouter();

  function onClick(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      const next = `/p/${encodeURIComponent(productId)}`;
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add to wishlist"
      title={user ? "Wishlist (coming soon)" : "Log in to save"}
      className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-text-subtle opacity-0 shadow-card backdrop-blur transition group-hover:opacity-100 hover:text-danger focus-visible:opacity-100"
    >
      <Heart className="h-4 w-4" />
    </button>
  );
}

export function ProductGrid({ hits }: { hits: SearchHit[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {hits.map((h) => (
        <ProductCard key={h.productId} hit={h} />
      ))}
    </div>
  );
}
