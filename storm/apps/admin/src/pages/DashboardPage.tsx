import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  PackageSearch,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Card, CardHeader } from "../components/ui/Card";
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
    <AdminShell>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of orders, revenue, and inventory health."
        actions={
          <RangePicker
            preset={preset}
            onPreset={setPreset}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFrom={setCustomFrom}
            onCustomTo={setCustomTo}
          />
        }
      />

      {isError ? (
        <div className="mb-6 rounded-md border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          Failed to load dashboard. Retry from the date range.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          icon={ShoppingBag}
          label="Orders"
          value={
            isFetching && !data
              ? "…"
              : data
                ? data.orders.count.toLocaleString("en-IN")
                : "—"
          }
          hint={data ? `${data.orders.cancelledCount} cancelled` : undefined}
          href="/orders"
        />
        <Tile
          icon={Wallet}
          label="Revenue"
          value={data ? formatINRCompact(data.orders.revenuePaise) : "—"}
          hint={data ? formatINR(data.orders.revenuePaise) : undefined}
        />
        <Tile
          icon={TrendingUp}
          label="Average order value"
          value={data ? formatINR(data.orders.aovPaise) : "—"}
        />
        <Tile
          icon={Users}
          label="New users"
          value={data ? data.users.newCount.toLocaleString("en-IN") : "—"}
          href="/users"
        />
        <Tile
          icon={PackageSearch}
          label="Low-stock SKUs"
          value={data ? data.inventory.lowStockCount.toLocaleString("en-IN") : "—"}
          href="/inventory/alerts"
          tone={data && data.inventory.lowStockCount > 0 ? "warning" : "default"}
        />
        <Tile
          icon={CreditCard}
          label="Failed payments"
          value={data ? data.payments.failedCount.toLocaleString("en-IN") : "—"}
          tone={data && data.payments.failedCount > 0 ? "danger" : "default"}
        />
      </div>

      {data?.warnings && data.warnings.length > 0 ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning-foreground">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden />
          Some metrics could not be loaded: {data.warnings.join(", ")}
        </div>
      ) : null}

      <section className="mt-6">
        <Card padding="lg">
          <CardHeader
            title="Recent orders"
            action={
              <Link
                to="/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                See all
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            }
          />
          {!data || data.recentOrders.length === 0 ? (
            <p className="text-sm text-text-subtle">No orders in this range.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {data.recentOrders.slice(0, 10).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      to={`/orders/${o.id}`}
                      className="font-medium text-text hover:text-primary"
                    >
                      #{o.id.slice(0, 8)}
                    </Link>
                    <p className="text-xs text-text-subtle">
                      {o.customerEmail ?? "—"} · {formatDateShortIST(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text">
                      {formatINR(o.totalPaise, o.currency)}
                    </p>
                    <p className="text-xs text-text-subtle">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink to="/orders?status=processing" label="Recent orders" />
        <QuickLink to="/orders?status=confirmed" label="Pending shipments" />
        <QuickLink to="/inventory/alerts" label="Low stock alerts" />
      </section>
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
    { key: "7d", label: "7d" },
    { key: "30d", label: "30d" },
    { key: "custom", label: "Custom" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-md border border-border bg-surface p-0.5 shadow-card">
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => props.onPreset(p.key)}
            className={
              "rounded px-3 py-1.5 text-xs font-medium transition " +
              (props.preset === p.key
                ? "bg-primary text-primary-foreground"
                : "text-text-muted hover:text-text")
            }
          >
            {p.label}
          </button>
        ))}
      </div>
      {props.preset === "custom" ? (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <input
            type="date"
            value={props.customFrom}
            onChange={(e) => props.onCustomFrom(e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <span>to</span>
          <input
            type="date"
            value={props.customTo}
            onChange={(e) => props.onCustomTo(e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      ) : null}
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string | undefined;
  href?: string | undefined;
  tone?: "default" | "warning" | "danger";
}) {
  const accent =
    tone === "warning"
      ? "bg-warning-soft text-warning-foreground"
      : tone === "danger"
        ? "bg-danger-soft text-danger"
        : "bg-primary-soft text-primary";
  const inner = (
    <Card padding="md" hoverable={!!href} className="h-full">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
          {label}
        </p>
        <span className={"flex h-8 w-8 items-center justify-center rounded-md " + accent}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-text">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </Card>
  );
  return href ? (
    <Link to={href} className="block">
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
      className="group flex items-center justify-between rounded-lg border border-border bg-surface p-4 text-sm font-medium text-text shadow-card transition hover:border-primary hover:shadow-card-hover"
    >
      {label}
      <ArrowRight className="h-4 w-4 text-text-subtle transition group-hover:text-primary" aria-hidden />
    </Link>
  );
}
