"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { useCurrentUser, useAuthBootstrapped } from "../../features/auth/auth.hooks";

const WishlistView = dynamic(
  () => import("../../features/wishlist/WishlistView").then((m) => m.WishlistView),
  { ssr: false },
);

export default function WishlistPage() {
  const user = useCurrentUser();
  const bootstrapped = useAuthBootstrapped();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Your wishlist</h1>
      {!bootstrapped ? (
        <p className="py-10 text-center text-neutral-500">Loading…</p>
      ) : !user ? (
        <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-neutral-700">Log in to view your wishlist.</p>
          <Link
            href="/auth/login?returnTo=/wishlist"
            className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Log in
          </Link>
        </div>
      ) : (
        <WishlistView />
      )}
    </main>
  );
}
