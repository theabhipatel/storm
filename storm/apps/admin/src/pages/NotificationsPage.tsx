import { useState } from "react";

import { AdminShell } from "../components/AdminShell";
import {
  useListAdminNotificationsQuery,
  useRetryAdminNotificationMutation,
  type AdminNotification,
} from "../features/notifications/notifications.api";
import { formatDateIST } from "../lib/format";

type ChannelFilter = "" | "email" | "sms";
type StatusFilter = "" | "queued" | "sent" | "failed";

const STATUS_STYLE: Record<AdminNotification["status"], string> = {
  queued: "bg-amber-100 text-amber-900",
  sent: "bg-emerald-100 text-emerald-900",
  failed: "bg-red-100 text-red-900",
};

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
    <AdminShell title="Notifications">
      <div className="space-y-4">
        <FiltersBar
          channel={channel}
          status={status}
          templateId={templateId}
          from={from}
          to={to}
          onChannel={setChannel}
          onStatus={setStatus}
          onTemplateId={setTemplateId}
          onFrom={setFrom}
          onTo={setTo}
          onReset={() => {
            setChannel("");
            setStatus("");
            setTemplateId("");
            setFrom("");
            setTo("");
          }}
        />

        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Template</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Attempts</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {!data || isFetching ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                    {isFetching ? "Loading…" : "No data"}
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                    No notifications match these filters.
                  </td>
                </tr>
              ) : (
                data.items.map((n) => (
                  <tr key={n.id} className="hover:bg-neutral-50">
                    <td className="px-3 py-2">
                      {n.sentAt
                        ? formatDateIST(n.sentAt)
                        : n.failedAt
                          ? formatDateIST(n.failedAt)
                          : "—"}
                    </td>
                    <td className="px-3 py-2 uppercase">{n.channel}</td>
                    <td className="px-3 py-2 font-mono text-xs">{n.templateId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{n.userId.slice(0, 8)}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[n.status]}`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{n.attempts}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(n)}
                        className="text-xs font-medium text-neutral-700 hover:underline"
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
                          className="ml-3 text-xs font-medium text-neutral-700 hover:underline"
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
      </div>
    </AdminShell>
  );
}

function FiltersBar(props: {
  channel: ChannelFilter;
  status: StatusFilter;
  templateId: string;
  from: string;
  to: string;
  onChannel: (v: ChannelFilter) => void;
  onStatus: (v: StatusFilter) => void;
  onTemplateId: (v: string) => void;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-200 bg-white p-3 text-xs">
      <Select label="Channel" value={props.channel} onChange={(v) => props.onChannel(v as ChannelFilter)}>
        <option value="">All</option>
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </Select>
      <Select label="Status" value={props.status} onChange={(v) => props.onStatus(v as StatusFilter)}>
        <option value="">All</option>
        <option value="queued">Queued</option>
        <option value="sent">Sent</option>
        <option value="failed">Failed</option>
      </Select>
      <label className="flex flex-col">
        <span className="font-semibold text-neutral-700">Template</span>
        <input
          value={props.templateId}
          onChange={(e) => props.onTemplateId(e.target.value)}
          placeholder="e.g. order-confirmation"
          className="mt-1 rounded border border-neutral-300 px-2 py-1"
        />
      </label>
      <label className="flex flex-col">
        <span className="font-semibold text-neutral-700">From</span>
        <input
          type="date"
          value={props.from}
          onChange={(e) => props.onFrom(e.target.value)}
          className="mt-1 rounded border border-neutral-300 px-2 py-1"
        />
      </label>
      <label className="flex flex-col">
        <span className="font-semibold text-neutral-700">To</span>
        <input
          type="date"
          value={props.to}
          onChange={(e) => props.onTo(e.target.value)}
          className="mt-1 rounded border border-neutral-300 px-2 py-1"
        />
      </label>
      <button
        type="button"
        onClick={props.onReset}
        className="ml-auto rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:border-neutral-400"
      >
        Reset
      </button>
    </div>
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
    <label className="flex flex-col">
      <span className="font-semibold text-neutral-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 rounded border border-neutral-300 px-2 py-1"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            Notification {notification.eventId.slice(0, 12)}…
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-neutral-500">Channel</dt>
          <dd>{notification.channel}</dd>
          <dt className="text-neutral-500">Template</dt>
          <dd className="font-mono text-xs">{notification.templateId}@v{notification.templateVersion}</dd>
          <dt className="text-neutral-500">User</dt>
          <dd className="font-mono text-xs">{notification.userId}</dd>
          <dt className="text-neutral-500">Status</dt>
          <dd>{notification.status}</dd>
          <dt className="text-neutral-500">Attempts</dt>
          <dd>{notification.attempts}</dd>
          {notification.errorMessage ? (
            <>
              <dt className="text-neutral-500">Error</dt>
              <dd className="text-red-700">{notification.errorMessage}</dd>
            </>
          ) : null}
        </dl>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Payload
        </h3>
        <pre className="mt-1 max-h-60 overflow-auto rounded bg-neutral-50 p-3 text-xs">
          {JSON.stringify(notification.payload, null, 2)}
        </pre>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Provider response
        </h3>
        <pre className="mt-1 max-h-60 overflow-auto rounded bg-neutral-50 p-3 text-xs">
          {JSON.stringify(notification.providerResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
}
