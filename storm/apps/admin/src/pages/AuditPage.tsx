import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { useGetAuditFeedQuery } from "../features/audit/audit.api";
import { formatDateIST } from "../lib/format";

export function AuditPage() {
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const args = useMemo(() => {
    const a: Parameters<typeof useGetAuditFeedQuery>[0] = {};
    if (actor) a.actor = actor;
    if (action) a.action = action;
    if (from) a.from = new Date(from).toISOString();
    if (to) a.to = new Date(to).toISOString();
    return a;
  }, [actor, action, from, to]);

  const { data, isFetching } = useGetAuditFeedQuery(args);

  return (
    <AdminShell title="Audit log">
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Stage 1: feed shows order status transitions only. Cross-service
          audit (user changes, admin actions) lands in Stage 2.
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-200 bg-white p-3 text-xs">
          <label className="flex flex-col">
            <span className="font-semibold text-neutral-700">Actor</span>
            <input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="user id or 'system'"
              className="mt-1 rounded border border-neutral-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold text-neutral-700">Action</span>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. shipped, cancelled"
              className="mt-1 rounded border border-neutral-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold text-neutral-700">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 rounded border border-neutral-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col">
            <span className="font-semibold text-neutral-700">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 rounded border border-neutral-300 px-2 py-1"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setActor("");
              setAction("");
              setFrom("");
              setTo("");
            }}
            className="ml-auto rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:border-neutral-400"
          >
            Reset
          </button>
        </div>

        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">From → To</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {!data || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                    {isFetching ? "Loading…" : "No data"}
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                    No audit entries match these filters.
                  </td>
                </tr>
              ) : (
                data.items.map((entry, idx) => (
                  <tr key={`${entry.orderId}-${entry.changedAt}-${idx}`} className="hover:bg-neutral-50">
                    <td className="px-3 py-2 align-top">{formatDateIST(entry.changedAt)}</td>
                    <td className="px-3 py-2 align-top">
                      <Link to={`/orders/${entry.orderId}`} className="font-medium text-neutral-900 hover:underline">
                        #{entry.orderId.slice(0, 8)}
                      </Link>
                      {entry.customerEmail ? (
                        <p className="text-xs text-neutral-500">{entry.customerEmail}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <span className="rounded bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
                        {entry.fromStatus ?? "—"}
                      </span>{" "}
                      →{" "}
                      <span className="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
                        {entry.toStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs">{entry.changedBy}</td>
                    <td className="px-3 py-2 align-top text-xs text-neutral-700">{entry.reason ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
