import { Link } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { useLowStockAlertsQuery } from "../features/inventory/inventory.api";

export function InventoryAlertsPage() {
  const { data, isFetching, error } = useLowStockAlertsQuery();

  return (
    <AdminShell title="Low stock alerts">
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900">Low stock alerts</h1>
          <Link to="/inventory" className="text-sm text-neutral-600 hover:underline">
            ← Back to inventory
          </Link>
        </header>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Failed to load alerts.
          </p>
        )}

        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">Available</th>
                <th className="px-3 py-2 text-right">Threshold</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isFetching && !data && (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-center text-neutral-500">
                    Loading…
                  </td>
                </tr>
              )}
              {data?.data.map((row) => (
                <tr key={row.sku} className="bg-red-50/30">
                  <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                  <td className="px-3 py-2 text-neutral-800">{row.productName ?? "—"}</td>
                  <td className="px-3 py-2 text-right font-semibold text-red-700">
                    {row.quantityAvailable}
                  </td>
                  <td className="px-3 py-2 text-right">{row.lowStockThreshold}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to={`/inventory/${encodeURIComponent(row.sku)}`}
                      className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-800"
                    >
                      Adjust
                    </Link>
                  </td>
                </tr>
              ))}
              {data && data.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-neutral-500">
                    No items are below threshold. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
