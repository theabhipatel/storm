"use client";

import { Heart, LogIn } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { EmptyState } from "../../components/domain/EmptyState";
import { useAuthBootstrapped, useCurrentUser } from "../../features/auth/auth.hooks";

const WishlistView = dynamic(
  () => import("../../features/wishlist/WishlistView").then((m) => m.WishlistView),
  { ssr: false },
);

export default function WishlistPage() {
  const user = useCurrentUser();
  const bootstrapped = useAuthBootstrapped();

  return (
    <main className="mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-2xl font-bold text-text">Your wishlist</h1>
      {!bootstrapped ? (
        <p className="py-10 text-center text-sm text-text-muted">Loading…</p>
      ) : !user ? (
        <EmptyState
          title="Log in to view your wishlist"
          description="Items you save will appear here once you're signed in."
          icon={<Heart className="h-8 w-8" />}
          secondary={
            <Link
              href="/auth/login?returnTo=/wishlist"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          }
        />
      ) : (
        <WishlistView />
      )}
    </main>
  );
}
