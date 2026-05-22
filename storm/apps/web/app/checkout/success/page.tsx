"use client";

import { CheckCircle2, Clock, FileText, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useGetOrderQuery } from "../../../features/orders/orders.api";
import { formatINR } from "../../../lib/format";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  return orderId ? <Confirming orderId={orderId} /> : <NoOrder />;
}

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-text-muted">Loading…</p>}>
        <SuccessInner />
      </Suspense>
    </main>
  );
}

function StatusCard({
  tone,
  icon,
  title,
  children,
}: {
  tone: "success" | "warning" | "danger" | "neutral";
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const TONE: Record<typeof tone, string> = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    neutral: "bg-primary-soft text-primary",
  };
  return (
    <Card padding="lg" className="text-center">
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${TONE[tone]}`}
      >
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      <div className="mt-2 text-sm text-text-muted">{children}</div>
    </Card>
  );
}

function Confirming({ orderId }: { orderId: string }) {
  const [pollMs, setPollMs] = useState(2000);
  const { data, isFetching, refetch } = useGetOrderQuery(orderId, {
    pollingInterval: pollMs,
  });

  useEffect(() => {
    if (data?.status && data.status !== "pending_payment") {
      setPollMs(0);
    }
  }, [data?.status]);

  if (!data) {
    return (
      <StatusCard
        tone="neutral"
        icon={<Loader2 className="h-8 w-8 animate-spin" />}
        title="Confirming your payment…"
      >
        This usually takes a few seconds. You can safely leave this page; we&apos;ll
        email you the confirmation.
      </StatusCard>
    );
  }

  if (data.status === "pending_payment") {
    return (
      <StatusCard
        tone="warning"
        icon={<Clock className="h-8 w-8" />}
        title="Almost there…"
      >
        We&apos;re waiting for Razorpay to confirm your payment.
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Checking…" : "Refresh now"}
          </Button>
        </div>
      </StatusCard>
    );
  }

  if (data.status === "failed") {
    return (
      <StatusCard
        tone="danger"
        icon={<XCircle className="h-8 w-8" />}
        title="Payment didn’t go through"
      >
        We weren&apos;t able to confirm your payment. No amount has been debited.
        <div className="mt-5 flex justify-center">
          <Link
            href="/cart"
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
          >
            Back to cart
          </Link>
        </div>
      </StatusCard>
    );
  }

  return (
    <Card padding="lg">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h1 className="text-center text-2xl font-bold text-text">Order confirmed</h1>
      <p className="mt-1 text-center text-sm text-text-muted">
        Thank you for shopping with Storm.
      </p>
      <dl className="mt-6 grid grid-cols-1 gap-3 rounded-lg bg-surface-muted p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
            Order ID
          </dt>
          <dd className="mt-0.5 font-mono text-text">{data.id.slice(0, 8)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
            Total paid
          </dt>
          <dd className="mt-0.5 font-semibold text-text">
            {formatINR(data.totalPaise, data.currency)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 inline-flex items-center gap-2 text-sm text-text-muted">
        <FileText className="h-4 w-4 text-primary" />
        We&apos;ve emailed your invoice. Download it any time from the order page.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href={`/orders/${data.id}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          View order
        </Link>
        <Link
          href="/orders"
          className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface-muted"
        >
          My orders
        </Link>
      </div>
    </Card>
  );
}

function NoOrder() {
  return (
    <StatusCard
      tone="neutral"
      icon={<FileText className="h-8 w-8" />}
      title="Order details not found"
    >
      <div className="mt-5 flex justify-center">
        <Link
          href="/orders"
          className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          View my orders
        </Link>
      </div>
    </StatusCard>
  );
}
