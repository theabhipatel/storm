import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { useListUsersQuery } from "../features/users/users.api";
import type { AdminUser, UserListFilters } from "../features/users/users.types";

export function UsersListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserListFilters>({ page: 1, pageSize: 20 });
  const { data, isFetching } = useListUsersQuery(filters);

  const columns = useMemo<DataTableColumn<AdminUser>[]>(
    () => [
      { key: "email", header: "Email", render: (r) => r.email },
      { key: "name", header: "Name", render: (r) => r.name },
      { key: "role", header: "Role", render: (r) => r.role },
      {
        key: "blocked",
        header: "Status",
        render: (r) =>
          r.blocked ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Blocked
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Active
            </span>
          ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN"),
        width: "140px",
      },
    ],
    [],
  );

  return (
    <AdminShell title="Users">
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Search
          </label>
          <input
            type="text"
            value={filters.q ?? ""}
            placeholder="email or name"
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
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
            className="mt-1 block w-36 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="">All</option>
            <option value="customer">customer</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Blocked
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
            className="mt-1 block w-36 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>
        </div>
      </div>

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
