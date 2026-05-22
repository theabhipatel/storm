import { ImageOff, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataTable, type DataTableColumn } from "../components/DataTable";
import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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

const selectCls =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

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
              className="h-10 w-10 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-muted text-text-subtle">
              <ImageOff className="h-4 w-4" aria-hidden />
            </div>
          ),
      },
      {
        key: "sku",
        header: "SKU",
        render: (r) => <span className="font-mono text-xs text-text-muted">{r.sku}</span>,
      },
      {
        key: "name",
        header: "Name",
        render: (r) => <span className="font-medium text-text">{r.name}</span>,
      },
      { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      {
        key: "brand",
        header: "Brand",
        render: (r) => brandName.get(r.brandId) ?? "—",
      },
      {
        key: "category",
        header: "Category",
        render: (r) => categoryName.get(r.categoryId) ?? "—",
      },
      {
        key: "price",
        header: "Price",
        align: "right",
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
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Catalog" }, { label: "Products" }]}
        title="Products"
        subtitle={`Manage your catalog${data ? ` · ${data.total} total` : ""}.`}
        actions={
          <Button
            variant="primary"
            leadingIcon={<Plus className="h-4 w-4" aria-hidden />}
            onClick={() => navigate("/catalog/products/new")}
          >
            New product
          </Button>
        }
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
                placeholder="name, SKU or slug"
                onChange={(e) =>
                  setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))
                }
                className="block w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
              Status
            </label>
            <select
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: (e.target.value || undefined) as ProductStatus | undefined,
                  page: 1,
                }))
              }
              className={`mt-1 block w-36 ${selectCls}`}
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
              Category
            </label>
            <select
              value={filters.categoryId ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  categoryId: e.target.value || undefined,
                  page: 1,
                }))
              }
              className={`mt-1 block w-48 ${selectCls}`}
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
            <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
              Brand
            </label>
            <select
              value={filters.brandId ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  brandId: e.target.value || undefined,
                  page: 1,
                }))
              }
              className={`mt-1 block w-48 ${selectCls}`}
            >
              <option value="">All</option>
              {(brands?.items ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
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
        onRowClick={(row) => navigate(`/catalog/products/${row.id}`)}
      />
    </AdminShell>
  );
}
