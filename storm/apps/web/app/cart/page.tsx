"use client";

import dynamic from "next/dynamic";

import { useCurrentUser, useAuthBootstrapped } from "../../features/auth/auth.hooks";

const CartView = dynamic(
  () => import("../../features/cart/CartView").then((m) => m.CartView),
  { ssr: false },
);
const AnonCartView = dynamic(
  () => import("../../features/cart/AnonCartView").then((m) => m.AnonCartView),
  { ssr: false },
);

export default function CartPage() {
  const user = useCurrentUser();
  const bootstrapped = useAuthBootstrapped();
  if (!bootstrapped) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Your cart</h1>
        <p className="py-10 text-center text-neutral-500">Loading…</p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Your cart</h1>
      {user ? <CartView /> : <AnonCartView />}
    </main>
  );
}
