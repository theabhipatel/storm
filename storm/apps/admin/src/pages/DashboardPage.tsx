import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { useGetDashboardQuery } from "../features/dashboard/dashboard.api";
import { formatDateShortIST, formatINR, formatINRCompact } from "../lib/format";

type RangePreset = "today" | "7d" | "30d" | "custom";

function isoStartOfDay(d: Date): string {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.toISOString();
}
function isoEndOfDay(d: Date): string {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c.toISOString();
}

function presetToRange(preset: RangePreset): { from: string; to: string } {
  const now = new Date();
  if (preset === "today") {
    return { from: isoStartOfDay(now), to: isoEndOfDay(now) };
  }
  const days = preset === "30d" ? 30 : 7;
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  return { from: isoStartOfDay(start), to: isoEndOfDay(now) };
}

export function DashboardPage() {
  const [preset, setPreset] = useState<RangePreset>("7d");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  const range = useMemo(() => {
    if (preset === "custom" && customFrom && customTo) {
      return {
        from: isoStartOfDay(new Date(customFrom)),
        to: isoEndOfDay(new Date(customTo)),
      };
    }
    return presetToRange(preset === "custom" ? "7d" : preset);
  }, [preset, customFrom, customTo]);

  const { data, isFetching, isError } = useGetDashboardQuery(range);

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-6">
        <RangePicker
          preset={preset}
          onPreset={setPreset}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFrom={setCustomFrom}
          onCustomTo={setCustomTo}
        />

        {isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Failed to load dashboard. Retry from the date range.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile
            label="Orders"
            value={
              isFetching && !data
                ? "…"
                : data
                  ? data.orders.count.toLocaleString("en-IN")
                  : "—"
            }
            hint={
              data ? `${data.orders.cancelledCount} cancelled` : undefined
            }
            href="/orders"
          />
          <Tile
            label="Revenue"
            value={data ? formatINRCompact(data.orders.revenuePaise) : "—"}
            hint={data ? formatINR(data.orders.revenuePaise, data.orders.cancelledCount > -1 ? "INR" : "INR") : undefined}
          />
          <Tile
            label="Average order value"
            value={data ? formatINR(data.orders.aovPaise) : "—"}
          />
          <Tile
            label="New users"
            value={data ? data.users.newCount.toLocaleString("en-IN") : "—"}
            href="/users"
          />
          <Tile
            label="Low-stock SKUs"
            value={data ? data.inventory.lowStockCount.toLocaleString("en-IN") : "—"}
            href="/inventory/alerts"
          />
          <Tile
            label="Failed payments"
            value={data ? data.payments.failedCount.toLocaleString("en-IN") : "—"}
          />
        </div>

        {data?.warnings && data.warnings.length > 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Some metrics could not be loaded: {data.warnings.join(", ")}
          </div>
        ) : null}

        <section className="rounded-md border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Recent orders</h2>
            <Link to="/orders" className="text-xs font-medium text-neutral-700 hover:underline">
              See all
            </Link>
          </div>
          {!data || data.recentOrders.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders in this range.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-sm">
              {data.recentOrders.slice(0, 10).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link to={`/orders/${o.id}`} className="font-medium text-neutral-900 hover:underline">
                      #{o.id.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {o.customerEmail ?? "—"} · {formatDateShortIST(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{formatINR(o.totalPaise, o.currency)}</p>
                    <p className="text-xs text-neutral-500">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickLink to="/orders?status=processing" label="Recent orders" />
          <QuickLink to="/orders?status=confirmed" label="Pending shipments" />
          <QuickLink to="/inventory/alerts" label="Low stock alerts" />
        </section>
      </div>
    </AdminShell>
  );
}

function RangePicker(props: {
  preset: RangePreset;
  onPreset: (p: RangePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFrom: (v: string) => void;
  onCustomTo: (v: string) => void;
}) {
  const presets: { key: RangePreset; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7 days" },
    { key: "30d", label: "Last 30 days" },
    { key: "custom", label: "Custom" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Range
      </span>
      {presets.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => props.onPreset(p.key)}
          className={
            "rounded-full px-3 py-1 text-xs font-medium border " +
            (props.preset === p.key
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400")
          }
        >
          {p.label}
        </button>
      ))}
      {props.preset === "custom" ? (
        <div className="flex items-center gap-2 text-xs text-neutral-700">
          <label className="flex items-center gap-1">
            From
            <input
              type="date"
              value={props.customFrom}
              onChange={(e) => props.onCustomFrom(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1">
            To
            <input
              type="date"
              value={props.customTo}
              onChange={(e) => props.onCustomTo(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  href?: string | undefined;
}) {
  const inner = (
    <div className="h-full rounded-md border border-neutral-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link to={href} className="block transition hover:shadow-sm">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block rounded-md border border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-800 hover:border-neutral-400"
    >
      {label} →
    </Link>
  );
}
