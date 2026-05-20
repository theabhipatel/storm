import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import {
  useAdjustStockMutation,
  useGetStockDetailQuery,
} from "../features/inventory/inventory.api";

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
    <AdminShell title={`SKU ${sku ?? ""}`}>
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <Link to="/inventory" className="text-sm text-neutral-600 hover:underline">
            ← Back to inventory
          </Link>
          {data && data.belowThreshold && (
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              Below threshold
            </span>
          )}
        </header>

        {isFetching && !data && (
          <p className="text-sm text-neutral-500">Loading…</p>
        )}
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Failed to load detail.
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4 rounded-md border border-neutral-200 bg-white p-4 sm:grid-cols-4">
              <Stat label="SKU" value={data.sku} />
              <Stat label="On hand" value={data.quantityOnHand} />
              <Stat label="Reserved" value={data.quantityReserved} />
              <Stat label="Available" value={data.quantityAvailable} highlight />
              <Stat label="Threshold" value={data.lowStockThreshold} />
              <Stat label="Updated" value={new Date(data.updatedAt).toLocaleString()} />
            </div>

            <form
              onSubmit={(e) => void submit(e)}
              className="space-y-3 rounded-md border border-neutral-200 bg-white p-4"
            >
              <h2 className="text-sm font-semibold text-neutral-900">Adjust stock</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs text-neutral-600">
                  Delta (+/-)
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(Number(e.target.value))}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-neutral-600">
                  Reason (required)
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-neutral-600">
                  New threshold (optional)
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={adjusting}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
              >
                {adjusting ? "Saving…" : "Apply adjustment"}
              </button>
              {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
              {success && <p className="text-sm text-emerald-600">{success}</p>}
            </form>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">
                Recent movements
              </h2>
              <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-3 py-2">When</th>
                      <th className="px-3 py-2 text-right">Delta</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Reservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {data.movements.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-3 text-center text-neutral-500">
                          No movements yet.
                        </td>
                      </tr>
                    )}
                    {data.movements.map((m) => (
                      <tr key={m.id}>
                        <td className="px-3 py-2 text-xs text-neutral-500">
                          {new Date(m.occurredAt).toLocaleString()}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-semibold ${m.delta < 0 ? "text-red-700" : "text-emerald-700"}`}
                        >
                          {m.delta > 0 ? "+" : ""}
                          {m.delta}
                        </td>
                        <td className="px-3 py-2">{m.reason}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {m.reservationId ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">
                Active reservations
              </h2>
              <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-3 py-2">Reservation</th>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {data.reservations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-3 text-center text-neutral-500">
                          No active reservations.
                        </td>
                      </tr>
                    )}
                    {data.reservations.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                        <td className="px-3 py-2 font-mono text-xs">{r.orderId}</td>
                        <td className="px-3 py-2 text-right">{r.qty}</td>
                        <td className="px-3 py-2 text-xs text-neutral-500">
                          {new Date(r.expiresAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>
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
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p
        className={`text-lg ${highlight ? "font-bold text-neutral-900" : "font-medium text-neutral-800"}`}
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
