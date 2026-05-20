import { useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
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
    <AdminShell title="Inventory">
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900">Inventory</h1>
          <Link
            to="/inventory/alerts"
            className="text-sm text-neutral-600 hover:underline"
          >
            View low-stock alerts →
          </Link>
        </header>

        <div className="flex flex-wrap items-center gap-3 rounded-md border border-neutral-200 bg-white p-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product name…"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Low stock only
          </label>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Failed to load stock items.
          </p>
        )}

        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2 text-right">On hand</th>
                <th className="px-3 py-2 text-right">Reserved</th>
                <th className="px-3 py-2 text-right">Available</th>
                <th className="px-3 py-2 text-right">Threshold</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isFetching && !data && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500">
                    Loading…
                  </td>
                </tr>
              )}
              {data?.data.map((row) => (
                <tr key={row.sku} className={row.belowThreshold ? "bg-red-50/30" : ""}>
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link
                      to={`/inventory/${encodeURIComponent(row.sku)}`}
                      className="text-neutral-900 hover:underline"
                    >
                      {row.sku}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-neutral-800">{row.productName ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{row.quantityOnHand}</td>
                  <td className="px-3 py-2 text-right">{row.quantityReserved}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {row.quantityAvailable}
                  </td>
                  <td className="px-3 py-2 text-right">{row.lowStockThreshold}</td>
                  <td className="px-3 py-2 text-xs text-neutral-500">
                    {new Date(row.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {data && data.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500">
                    No stock items match the filter.
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
