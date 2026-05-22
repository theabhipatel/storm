import { Search, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useListStockQuery } from "../features/inventory/inventory.api";

export function InventoryListPage() {
  const [q, setQ] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data, isFetching, error } = useListStockQuery({
    q: q || undefined,
    lowStockOnly: lowStockOnly || undefined,
    limit: 50,
  });

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Inventory" }]}
        title="Stock list"
        subtitle={data ? `${data.data.length} SKUs shown.` : undefined}
        actions={
          <Link to="/inventory/alerts">
            <Button
              variant="outline"
              leadingIcon={<TriangleAlert className="h-4 w-4" aria-hidden />}
            >
              View low-stock alerts
            </Button>
          </Link>
        }
      />

      <Card padding="md" className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product name…"
              className="block w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring/30"
            />
            Low stock only
          </label>
        </div>
      </Card>

      {error && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          Failed to load stock items.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">On hand</th>
              <th className="px-4 py-3 text-right">Reserved</th>
              <th className="px-4 py-3 text-right">Available</th>
              <th className="px-4 py-3 text-right">Threshold</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isFetching && !data && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-text-subtle">
                  Loading…
                </td>
              </tr>
            )}
            {data?.data.map((row) => (
              <tr
                key={row.sku}
                className={
                  "transition hover:bg-surface-muted " +
                  (row.belowThreshold ? "bg-danger-soft/30" : "")
                }
              >
                <td className="px-4 py-3 font-mono text-xs">
                  <Link
                    to={`/inventory/${encodeURIComponent(row.sku)}`}
                    className="text-primary hover:underline"
                  >
                    {row.sku}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text">{row.productName ?? "—"}</td>
                <td className="px-4 py-3 text-right text-text">
                  {row.quantityOnHand}
                </td>
                <td className="px-4 py-3 text-right text-text">
                  {row.quantityReserved}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-text">
                  {row.quantityAvailable}
                </td>
                <td className="px-4 py-3 text-right text-text-muted">
                  {row.lowStockThreshold}
                </td>
                <td className="px-4 py-3 text-xs text-text-subtle">
                  {new Date(row.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-text-subtle">
                  No stock items match the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
