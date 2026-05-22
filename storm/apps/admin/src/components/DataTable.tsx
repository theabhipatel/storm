import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
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
  emptyState,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  emptyState?: ReactNode;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-text-subtle">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={
                    "px-4 py-3 " +
                    (c.align === "right"
                      ? "text-right"
                      : c.align === "center"
                        ? "text-center"
                        : "text-left")
                  }
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                    Loading…
                  </span>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-text-muted">
                  {emptyState ?? "No results."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={
                    "transition " +
                    (onRowClick ? "cursor-pointer hover:bg-surface-muted" : "")
                  }
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={
                        "px-4 py-3 text-text " +
                        (c.align === "right"
                          ? "text-right"
                          : c.align === "center"
                            ? "text-center"
                            : "")
                      }
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-surface-muted px-4 py-2.5 text-xs text-text-muted">
        <div>
          Page <span className="font-medium text-text">{page}</span> of{" "}
          <span className="font-medium text-text">{totalPages}</span> &middot;{" "}
          <span className="font-medium text-text">{total}</span> total
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
