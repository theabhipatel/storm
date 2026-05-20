"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AccountShell } from "../../../components/domain/AccountShell";
import { useAuthBootstrapped, useCurrentUser } from "../../../features/auth/auth.hooks";

const OrderDetail = dynamic(
  () => import("../../../features/orders/OrderDetail").then((m) => m.OrderDetail),
  { ssr: false },
);

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const bootstrapped = useAuthBootstrapped();
  const user = useCurrentUser();
  const router = useRouter();
  const id = params?.id ?? "";

  useEffect(() => {
    if (bootstrapped && !user) router.replace(`/auth/login?returnTo=/orders/${id}`);
  }, [bootstrapped, user, router, id]);

  return (
    <AccountShell title="Order details">
      {!user || !id ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <OrderDetail orderId={id} />
      )}
    </AccountShell>
  );
}
