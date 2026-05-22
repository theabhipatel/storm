import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataTable, type DataTableColumn } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useListUsersQuery } from "../features/users/users.api";
import type { AdminUser, UserListFilters } from "../features/users/users.types";
import { formatDateShortIST } from "../lib/format";

const selectCls =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

export function UsersListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserListFilters>({ page: 1, pageSize: 20 });
  const { data, isFetching } = useListUsersQuery(filters);

  const columns = useMemo<DataTableColumn<AdminUser>[]>(
    () => [
      {
        key: "email",
        header: "Email",
        render: (r) => <span className="font-medium text-text">{r.email}</span>,
      },
      { key: "name", header: "Name", render: (r) => r.name },
      {
        key: "role",
        header: "Role",
        render: (r) => (
          <Badge variant={r.role === "admin" ? "soft-primary" : "neutral"} size="sm">
            {r.role}
          </Badge>
        ),
      },
      {
        key: "blocked",
        header: "Status",
        render: (r) =>
          r.blocked ? (
            <Badge variant="soft-danger" size="sm">
              Blocked
            </Badge>
          ) : (
            <Badge variant="soft-success" size="sm">
              Active
            </Badge>
          ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (r) => formatDateShortIST(r.createdAt),
        width: "140px",
      },
    ],
    [],
  );

  const exportFilters: Record<string, string> = {};
  if (filters.q) exportFilters["q"] = filters.q;
  if (filters.role) exportFilters["role"] = filters.role;
  if (filters.blocked) exportFilters["blocked"] = filters.blocked;

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Users" }]}
        title="Users"
        subtitle={data ? `${data.total} total.` : undefined}
        actions={<ExportButton kind="users" filters={exportFilters} />}
      />

      <Card padding="md" className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
              Search
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
                aria-hidden
              />
              <input
                type="text"
                value={filters.q ?? ""}
                placeholder="email or name"
                onChange={(e) =>
                  setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))
                }
                className="block w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
              Role
            </label>
            <select
              value={filters.role ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  role: (e.target.value || undefined) as UserListFilters["role"],
                  page: 1,
                }))
              }
              className={`mt-1 block w-36 ${selectCls}`}
            >
              <option value="">All</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
              Status
            </label>
            <select
              value={filters.blocked ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  blocked: (e.target.value || undefined) as UserListFilters["blocked"],
                  page: 1,
                }))
              }
              className={`mt-1 block w-36 ${selectCls}`}
            >
              <option value="">All</option>
              <option value="false">Active</option>
              <option value="true">Blocked</option>
            </select>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        loading={isFetching}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 20}
        total={data?.total ?? 0}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
      />
    </AdminShell>
  );
}
