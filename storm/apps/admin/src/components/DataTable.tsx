import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  onRowClick,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-2 font-medium"
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-neutral-500">
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-neutral-500">
                No results.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={
                  "transition " +
                  (onRowClick ? "cursor-pointer hover:bg-neutral-50" : "")
                }
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-neutral-800">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-sm">
        <div className="text-neutral-600">
          Page {page} of {totalPages} • {total} total
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded border border-neutral-300 bg-white px-3 py-1 text-neutral-700 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded border border-neutral-300 bg-white px-3 py-1 text-neutral-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
