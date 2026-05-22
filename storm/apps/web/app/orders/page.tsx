"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AccountShell } from "../../components/domain/AccountShell";
import { useAuthBootstrapped, useCurrentUser } from "../../features/auth/auth.hooks";

const OrdersList = dynamic(
  () => import("../../features/orders/OrdersList").then((m) => m.OrdersList),
  { ssr: false },
);

export default function OrdersPage() {
  const bootstrapped = useAuthBootstrapped();
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (bootstrapped && !user) router.replace("/auth/login?returnTo=/orders");
  }, [bootstrapped, user, router]);

  return (
    <AccountShell title="Orders">
      {!user ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <OrdersList />
      )}
    </AccountShell>
  );
}
