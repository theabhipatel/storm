"use client";

import { Bell, Mail, MessageSquare } from "lucide-react";

import { Badge } from "../../components/ui/Badge";
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

function statusBadge(status: string) {
  if (status === "sent") return <Badge variant="success" size="sm">SENT</Badge>;
  if (status === "failed") return <Badge variant="danger" size="sm">FAILED</Badge>;
  return <Badge variant="warning" size="sm">{status.toUpperCase()}</Badge>;
}

function channelIcon(channel: string) {
  if (channel.toLowerCase() === "sms")
    return <MessageSquare className="h-4 w-4 text-text-subtle" />;
  if (channel.toLowerCase() === "email")
    return <Mail className="h-4 w-4 text-text-subtle" />;
  return <Bell className="h-4 w-4 text-text-subtle" />;
}

export function NotificationsList() {
  const { data, isLoading, isError } = useListNotificationsQuery();
  if (isLoading) return <p className="py-10 text-center text-sm text-text-muted">Loading…</p>;
  if (isError)
    return (
      <p className="py-10 text-center text-sm font-medium text-danger">
        Could not load notifications.
      </p>
    );
  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface-muted p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Bell className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-text">No notifications yet</p>
        <p className="text-xs text-text-muted">
          You&apos;ll see order updates and important messages here.
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {data.items.map((n) => (
        <li
          key={n.eventId + ":" + n.channel + ":" + n.templateId}
          className="rounded-md border border-border bg-surface p-3 shadow-card"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {channelIcon(n.channel)}
              <p className="truncate text-sm font-medium text-text">{label(n.templateId)}</p>
            </div>
            {statusBadge(n.status)}
          </div>
          <p className="mt-1 text-xs text-text-subtle">
            {formatIst(n.sentAt ?? n.failedAt)} IST
          </p>
        </li>
      ))}
    </ul>
  );
}
