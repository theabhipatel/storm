"use client";

import dynamic from "next/dynamic";

import { CartSkeleton } from "../../components/ui/Skeletons";
import { useAuthBootstrapped, useCurrentUser } from "../../features/auth/auth.hooks";

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
  return (
    <main className="mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-2xl font-bold text-text">Your cart</h1>
      {!bootstrapped ? (
        <CartSkeleton />
      ) : user ? (
        <CartView />
      ) : (
        <AnonCartView />
      )}
    </main>
  );
}
