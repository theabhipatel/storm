import { X } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { IconButton } from "../components/ui/IconButton";
import {
  useListAdminNotificationsQuery,
  useRetryAdminNotificationMutation,
  type AdminNotification,
} from "../features/notifications/notifications.api";
import { formatDateIST } from "../lib/format";

type ChannelFilter = "" | "email" | "sms";
type StatusFilter = "" | "queued" | "sent" | "failed";

const STATUS_VARIANTS: Record<AdminNotification["status"], "soft-warning" | "soft-success" | "soft-danger"> = {
  queued: "soft-warning",
  sent: "soft-success",
  failed: "soft-danger",
};

const inputCls =
  "rounded-md border border-border bg-surface px-3 py-1.5 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

export function NotificationsPage() {
  const [channel, setChannel] = useState<ChannelFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [templateId, setTemplateId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<AdminNotification | null>(null);

  const args: Parameters<typeof useListAdminNotificationsQuery>[0] = {};
  if (channel) args.channel = channel;
  if (status) args.status = status;
  if (templateId) args.templateId = templateId;
  if (from) args.from = new Date(from).toISOString();
  if (to) args.to = new Date(to).toISOString();

  const { data, isFetching, refetch } = useListAdminNotificationsQuery(args);
  const [retry, retryState] = useRetryAdminNotificationMutation();

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Notifications" }]}
        title="Notifications"
        subtitle="Transactional emails and SMS sent by Storm."
      />
      <Card padding="md" className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Channel" value={channel} onChange={(v) => setChannel(v as ChannelFilter)}>
            <option value="">All</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </Select>
          <Select label="Status" value={status} onChange={(v) => setStatus(v as StatusFilter)}>
            <option value="">All</option>
            <option value="queued">Queued</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </Select>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
            Template
            <input
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              placeholder="e.g. order-confirmation"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputCls}
            />
          </label>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => {
              setChannel("");
              setStatus("");
              setTemplateId("");
              setFrom("");
              setTo("");
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Template</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Attempts</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!data || isFetching ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-text-subtle">
                  {isFetching ? "Loading…" : "No data"}
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-text-subtle">
                  No notifications match these filters.
                </td>
              </tr>
            ) : (
              data.items.map((n) => (
                <tr key={n.id} className="transition hover:bg-surface-muted">
                  <td className="px-4 py-3 text-text">
                    {n.sentAt
                      ? formatDateIST(n.sentAt)
                      : n.failedAt
                        ? formatDateIST(n.failedAt)
                        : "—"}
                  </td>
                  <td className="px-4 py-3 uppercase text-text-muted">{n.channel}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{n.templateId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{n.userId.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[n.status]} size="sm">
                      {n.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-text-muted">{n.attempts}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(n)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View
                    </button>
                    {n.status === "failed" ? (
                      <button
                        type="button"
                        disabled={retryState.isLoading}
                        onClick={async () => {
                          await retry(n.eventId).unwrap();
                          await refetch();
                        }}
                        className="ml-3 text-xs font-medium text-primary hover:underline"
                      >
                        Retry
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected ? (
        <NotificationDetailDialog
          notification={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </AdminShell>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        {children}
      </select>
    </label>
  );
}

function NotificationDetailDialog({
  notification,
  onClose,
}: {
  notification: AdminNotification;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notification details"
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/40 px-4"
    >
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">
            Notification {notification.eventId.slice(0, 12)}…
          </h2>
          <IconButton aria-label="Close" size="sm" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-text-muted">Channel</dt>
          <dd className="text-text">{notification.channel}</dd>
          <dt className="text-text-muted">Template</dt>
          <dd className="font-mono text-xs text-text">
            {notification.templateId}@v{notification.templateVersion}
          </dd>
          <dt className="text-text-muted">User</dt>
          <dd className="font-mono text-xs text-text">{notification.userId}</dd>
          <dt className="text-text-muted">Status</dt>
          <dd className="text-text">{notification.status}</dd>
          <dt className="text-text-muted">Attempts</dt>
          <dd className="text-text">{notification.attempts}</dd>
          {notification.errorMessage ? (
            <>
              <dt className="text-text-muted">Error</dt>
              <dd className="text-danger">{notification.errorMessage}</dd>
            </>
          ) : null}
        </dl>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-subtle">
          Payload
        </h3>
        <pre className="mt-1 max-h-60 overflow-auto rounded-md bg-surface-muted p-3 text-xs text-text">
          {JSON.stringify(notification.payload, null, 2)}
        </pre>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-subtle">
          Provider response
        </h3>
        <pre className="mt-1 max-h-60 overflow-auto rounded-md bg-surface-muted p-3 text-xs text-text">
          {JSON.stringify(notification.providerResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
}
