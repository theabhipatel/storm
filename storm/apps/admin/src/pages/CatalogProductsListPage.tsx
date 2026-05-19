import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { DataTable, type DataTableColumn } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import {
  useListBrandsQuery,
  useListCategoryTreeQuery,
  useListProductsQuery,
  type AdminProductSummary,
  type CategoryTreeNode,
  type ProductListFilters,
  type ProductStatus,
} from "../features/catalog/catalog.api";
import { MEDIA_BASE_URL } from "../features/media/media.api";
import { formatINR } from "../lib/format";

export function CatalogProductsListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProductListFilters>({ page: 1, pageSize: 20 });
  const { data, isFetching } = useListProductsQuery(filters);
  const { data: brands } = useListBrandsQuery();
  const { data: categories } = useListCategoryTreeQuery();

  const brandName = useMemo(() => {
    const m = new Map<string, string>();
    (brands?.items ?? []).forEach((b) => m.set(b.id, b.name));
    return m;
  }, [brands]);
  const categoryName = useMemo(() => {
    const m = new Map<string, string>();
    const walk = (nodes: CategoryTreeNode[]) => {
      for (const n of nodes) {
        m.set(n.id, n.name);
        walk(n.children);
      }
    };
    walk(categories?.items ?? []);
    return m;
  }, [categories]);

  const columns = useMemo<DataTableColumn<AdminProductSummary>[]>(
    () => [
      {
        key: "image",
        header: "",
        width: "64px",
        render: (r) =>
          r.primaryMediaId ? (
            <img
              src={`${MEDIA_BASE_URL}/api/media/${r.primaryMediaId}/raw`}
              alt=""
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-neutral-100" />
          ),
      },
      { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
      { key: "name", header: "Name", render: (r) => r.name },
      { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      { key: "brand", header: "Brand", render: (r) => brandName.get(r.brandId) ?? "—" },
      { key: "category", header: "Category", render: (r) => categoryName.get(r.categoryId) ?? "—" },
      {
        key: "price",
        header: "Price",
        render: (r) => formatINR(r.basePrice, r.currency),
        width: "140px",
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (r) => new Date(r.updatedAt).toLocaleDateString("en-IN"),
        width: "120px",
      },
    ],
    [brandName, categoryName],
  );

  return (
    <AdminShell title="Catalog · Products">
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Search</label>
          <input
            type="text"
            value={filters.q ?? ""}
            placeholder="name, SKU or slug"
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Status</label>
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value || undefined) as ProductStatus | undefined,
                page: 1,
              }))
            }
            className="mt-1 block w-36 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Category</label>
          <select
            value={filters.categoryId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoryId: e.target.value || undefined, page: 1 }))
            }
            className="mt-1 block w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {[...categoryName.entries()].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">Brand</label>
          <select
            value={filters.brandId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, brandId: e.target.value || undefined, page: 1 }))
            }
            className="mt-1 block w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {(brands?.items ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <Link
          to="/catalog/products/new"
          className="ml-auto rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
        >
          + New product
        </Link>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        loading={isFetching}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 20}
        total={data?.total ?? 0}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onRowClick={(row) => navigate(`/catalog/products/${row.id}`)}
      />
    </AdminShell>
  );
}
