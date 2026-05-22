import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { Card } from "../components/ui/Card";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useListBrandsQuery,
  useUpdateBrandMutation,
} from "../features/catalog/catalog.api";

export function CatalogBrandsPage() {
  const { data, isFetching } = useListBrandsQuery();
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createBrand({ name }).unwrap();
      setName("");
    } catch (err) {
      setError(asMessage(err));
    }
  }

  async function rename(id: string) {
    const next = prompt("New brand name?");
    if (!next) return;
    try {
      await updateBrand({ id, data: { name: next } }).unwrap();
    } catch (err) {
      setError(asMessage(err));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this brand?")) return;
    try {
      await deleteBrand(id).unwrap();
    } catch (err) {
      setError(asMessage(err));
    }
  }

  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[{ label: "Catalog" }, { label: "Brands" }]}
        title="Brands"
        subtitle={data ? `${data.items.length} brands.` : undefined}
      />
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            {error}
          </div>
        )}
        <Card padding="md">
          <form onSubmit={add} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                New brand
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Acer"
                className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
            >
              Add brand
            </button>
          </form>
        </Card>

        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-subtle">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isFetching && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-text-subtle">
                    Loading…
                  </td>
                </tr>
              )}
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-text-subtle">
                    No brands yet.
                  </td>
                </tr>
              )}
              {(data?.items ?? []).map((b) => (
                <tr key={b.id} className="transition hover:bg-surface-muted">
                  <td className="px-4 py-3 font-medium text-text">{b.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{b.slug}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => rename(b.id)}
                      className="mr-1 inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-muted transition hover:bg-surface-muted hover:text-text"
                    >
                      <Pencil className="h-3 w-3" aria-hidden />
                      Rename
                    </button>
                    <button
                      onClick={() => remove(b.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-danger/40 px-2 py-1 text-xs text-danger transition hover:bg-danger-soft"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function asMessage(err: unknown): string {
  if (typeof err === "object" && err && "data" in err) {
    const data = (err as { data?: { error?: { message?: string } } }).data;
    if (data?.error?.message) return data.error.message;
  }
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message?: string }).message);
  }
  return "Something went wrong.";
}
