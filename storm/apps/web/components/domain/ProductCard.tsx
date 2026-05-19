"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SearchHit } from "@storm/contracts";

import { useCurrentUser } from "../../features/auth/auth.hooks";
import { formatINR } from "../../lib/format";

export function ProductCard({ hit }: { hit: SearchHit }) {
  return (
    <div className="group relative flex flex-col rounded-md border border-neutral-200 bg-white transition hover:shadow-md">
      <WishlistHeart productId={hit.productId} />
      <Link href={`/p/${hit.slug}`} className="flex h-full flex-col p-3">
        <div className="relative aspect-square overflow-hidden rounded bg-neutral-100">
          {hit.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hit.primaryImageUrl}
              alt={hit.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
              No image
            </div>
          )}
          {!hit.inStock && (
            <span className="absolute left-2 top-2 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
              Out of stock
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-neutral-500">{hit.brandName}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">{hit.name}</h3>
        <div className="mt-auto pt-2 text-base font-semibold text-neutral-900">
          {formatINR(hit.basePrice, hit.currency)}
        </div>
      </Link>
    </div>
  );
}

// Anonymous users → redirected to login (plan §Product card).
// Authed users → wishlist wiring lands on Day 6; for now it's a no-op
// placeholder so the icon is visible across the catalog.
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
    // Authed: wishlist endpoints arrive on Day 6.
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add to wishlist"
      title={user ? "Wishlist (coming Day 6)" : "Log in to save"}
      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-sm transition hover:text-rose-600"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

export function ProductGrid({ hits }: { hits: SearchHit[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {hits.map((h) => (
        <ProductCard key={h.productId} hit={h} />
      ))}
    </div>
  );
}
