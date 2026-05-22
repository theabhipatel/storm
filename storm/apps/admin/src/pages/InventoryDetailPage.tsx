import { useState } from "react";
import { useParams } from "react-router-dom";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import {
  useAdjustStockMutation,
  useGetStockDetailQuery,
} from "../features/inventory/inventory.api";

const inputCls =
  "rounded-md border border-border bg-surface px-3 py-1.5 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

export function InventoryDetailPage() {
  const { sku } = useParams<{ sku: string }>();
  const { data, isFetching, error } = useGetStockDetailQuery(sku ?? "", { skip: !sku });
  const [adjustStock, { isLoading: adjusting }] = useAdjustStockMutation();

  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setErrMsg(null);
    setSuccess(null);
    if (!sku || delta === 0 || !reason.trim()) {
      setErrMsg("Delta must be non-zero and reason is required.");
      return;
    }
    try {
      const payload: Parameters<typeof adjustStock>[0] = {
        sku,
        delta,
        reason: reason.trim(),
      };
      if (threshold !== "") {
        payload.lowStockThreshold = Number(threshold);
      }
      await adjustStock(payload).unwrap();
      setSuccess("Stock adjusted.");
      setDelta(0);
      setReason("");
    } catch (err: unknown) {
      setErrMsg(asMessage(err));
    }
  }

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[
          { label: "Inventory", to: "/inventory" },
          { label: sku ?? "" },
        ]}
        title={sku ? `SKU ${sku}` : "Stock detail"}
        actions={
          data?.belowThreshold ? <Badge variant="soft-danger">Below threshold</Badge> : null
        }
      />

      <div className="space-y-4">
        {isFetching && !data && (
          <p className="text-sm text-text-subtle">Loading…</p>
        )}
        {error && (
          <p className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            Failed to load detail.
          </p>
        )}

        {data && (
          <>
            <Card padding="lg">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <Stat label="SKU" value={data.sku} />
                <Stat label="On hand" value={data.quantityOnHand} />
                <Stat label="Reserved" value={data.quantityReserved} />
                <Stat label="Available" value={data.quantityAvailable} highlight />
                <Stat label="Threshold" value={data.lowStockThreshold} />
                <Stat label="Updated" value={new Date(data.updatedAt).toLocaleString()} />
              </div>
            </Card>

            <Card padding="lg">
              <CardHeader title="Adjust stock" description="Movements are recorded in the audit log." />
              <form onSubmit={(e) => void submit(e)} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
                    Delta (+/-)
                    <input
                      type="number"
                      value={delta}
                      onChange={(e) => setDelta(Number(e.target.value))}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
                    Reason (required)
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
                    New threshold (optional)
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className={inputCls}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={adjusting}>
                    {adjusting ? "Saving…" : "Apply adjustment"}
                  </Button>
                  {errMsg && <p className="text-sm text-danger">{errMsg}</p>}
                  {success && <p className="text-sm text-success">{success}</p>}
                </div>
              </form>
            </Card>

            <Card padding="lg">
              <CardHeader title="Recent movements" />
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2 text-right">Delta</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Reservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.movements.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-3 text-center text-text-subtle">
                          No movements yet.
                        </td>
                      </tr>
                    )}
                    {data.movements.map((m) => (
                      <tr key={m.id}>
                        <td className="px-3 py-2 text-xs text-text-subtle">
                          {new Date(m.occurredAt).toLocaleString()}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-semibold ${m.delta < 0 ? "text-danger" : "text-success"}`}
                        >
                          {m.delta > 0 ? "+" : ""}
                          {m.delta}
                        </td>
                        <td className="px-3 py-2 text-text">{m.reason}</td>
                        <td className="px-3 py-2 font-mono text-xs text-text-muted">
                          {m.reservationId ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card padding="lg">
              <CardHeader title="Active reservations" />
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
                    <tr>
                      <th className="px-3 py-2">Reservation</th>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.reservations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-3 text-center text-text-subtle">
                          No active reservations.
                        </td>
                      </tr>
                    )}
                    {data.reservations.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2 font-mono text-xs text-text-muted">{r.id}</td>
                        <td className="px-3 py-2 font-mono text-xs text-text-muted">{r.orderId}</td>
                        <td className="px-3 py-2 text-right text-text">{r.qty}</td>
                        <td className="px-3 py-2 text-xs text-text-subtle">
                          {new Date(r.expiresAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
        {label}
      </p>
      <p
        className={`mt-1 ${highlight ? "text-2xl font-bold text-primary" : "text-lg font-medium text-text"}`}
      >
        {value}
      </p>
    </div>
  );
}

function asMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { error?: { message?: string } } }).data;
    return data?.error?.message ?? "Request failed.";
  }
  return "Request failed.";
}
