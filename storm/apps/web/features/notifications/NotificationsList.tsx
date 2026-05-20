"use client";

import { useListNotificationsQuery } from "./notifications.api";

const TEMPLATE_LABELS: Record<string, string> = {
  "order-confirmed": "Order confirmed",
  "order-confirmed-sms": "Order confirmed (SMS)",
  "order-status-processing": "Order being prepared",
  "order-status-processing-sms": "Order being prepared (SMS)",
  "order-status-shipped": "Order shipped",
  "order-status-shipped-sms": "Order shipped (SMS)",
  "order-status-delivered": "Order delivered",
  "order-status-delivered-sms": "Order delivered (SMS)",
  "order-cancelled-by-customer": "Order cancellation confirmed",
  "order-cancelled-by-customer-sms": "Order cancellation confirmed (SMS)",
  "order-cancelled-by-admin": "Order cancelled",
  "order-cancelled-by-admin-sms": "Order cancelled (SMS)",
};

function label(templateId: string): string {
  return TEMPLATE_LABELS[templateId] ?? templateId;
}

function formatIst(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function NotificationsList() {
  const { data, isLoading, isError } = useListNotificationsQuery();
  if (isLoading) return <p className="py-10 text-center text-neutral-500">Loading…</p>;
  if (isError) return <p className="py-10 text-center text-red-700">Could not load notifications.</p>;
  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-600">
        No notifications yet.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {data.items.map((n) => (
        <li
          key={n.eventId + ":" + n.channel + ":" + n.templateId}
          className="rounded-md border border-neutral-200 bg-white p-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-900">{label(n.templateId)}</p>
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs " +
                (n.status === "sent"
                  ? "bg-emerald-100 text-emerald-800"
                  : n.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800")
              }
            >
              {n.channel.toUpperCase()} · {n.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{formatIst(n.sentAt ?? n.failedAt)} IST</p>
        </li>
      ))}
    </ul>
  );
}
