"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthBootstrapped, useCurrentUser } from "../../features/auth/auth.hooks";

const CheckoutView = dynamic(
  () => import("../../features/orders/CheckoutView").then((m) => m.CheckoutView),
  { ssr: false },
);

export default function CheckoutPage() {
  const bootstrapped = useAuthBootstrapped();
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (bootstrapped && !user) {
      router.replace("/auth/login?returnTo=/checkout");
    }
  }, [bootstrapped, user, router]);

  return (
    <main className="mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-2xl font-bold text-text">Checkout</h1>
      {!bootstrapped || !user ? (
        <p className="py-10 text-center text-sm text-text-muted">Loading…</p>
      ) : (
        <CheckoutView />
      )}
    </main>
  );
}
