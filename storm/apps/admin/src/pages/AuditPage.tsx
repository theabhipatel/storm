import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useGetAuditFeedQuery } from "../features/audit/audit.api";
import { formatDateIST } from "../lib/format";

const inputCls =
  "rounded-md border border-border bg-surface px-3 py-1.5 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

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
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Audit log" }]}
        title="Audit log"
        subtitle="Order status transitions and other operator actions."
      />

      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning-foreground">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
          Stage 1: feed shows order status transitions only. Cross-service audit
          (user changes, admin actions) lands in Stage 2.
        </div>

        <Card padding="md">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
              Actor
              <input
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="user id or 'system'"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
              Action
              <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. shipped, cancelled"
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
                setActor("");
                setAction("");
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
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Transition</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!data || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-text-subtle">
                    {isFetching ? "Loading…" : "No data"}
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-text-subtle">
                    No audit entries match these filters.
                  </td>
                </tr>
              ) : (
                data.items.map((entry, idx) => (
                  <tr
                    key={`${entry.orderId}-${entry.changedAt}-${idx}`}
                    className="transition hover:bg-surface-muted"
                  >
                    <td className="px-4 py-3 align-top text-text">{formatDateIST(entry.changedAt)}</td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        to={`/orders/${entry.orderId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        #{entry.orderId.slice(0, 8)}
                      </Link>
                      {entry.customerEmail ? (
                        <p className="text-xs text-text-subtle">{entry.customerEmail}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center gap-2 text-xs">
                        <Badge variant="neutral" size="sm">
                          {entry.fromStatus ?? "—"}
                        </Badge>
                        <span className="text-text-subtle">→</span>
                        <Badge variant="soft-success" size="sm">
                          {entry.toStatus}
                        </Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-xs text-text-muted">
                      {entry.changedBy}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-text">
                      {entry.reason ?? "—"}
                    </td>
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
