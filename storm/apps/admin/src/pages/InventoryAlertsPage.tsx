import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { useLowStockAlertsQuery } from "../features/inventory/inventory.api";

export function InventoryAlertsPage() {
  const { data, isFetching, error } = useLowStockAlertsQuery();

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Inventory", to: "/inventory" }, { label: "Low-stock alerts" }]}
        title="Low-stock alerts"
        subtitle={
          data ? `${data.data.length} SKU${data.data.length === 1 ? "" : "s"} at or below threshold.` : undefined
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          Failed to load alerts.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">Available</th>
              <th className="px-4 py-3 text-right">Threshold</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isFetching && !data && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-text-subtle">
                  Loading…
                </td>
              </tr>
            )}
            {data?.data.map((row) => (
              <tr key={row.sku} className="bg-danger-soft/30 transition hover:bg-danger-soft/50">
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{row.sku}</td>
                <td className="px-4 py-3 text-text">{row.productName ?? "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-danger">
                  {row.quantityAvailable}
                </td>
                <td className="px-4 py-3 text-right text-text-muted">{row.lowStockThreshold}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/inventory/${encodeURIComponent(row.sku)}`}
                    className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
                  >
                    Adjust
                  </Link>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center">
                  <span className="inline-flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    No items are below threshold.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
