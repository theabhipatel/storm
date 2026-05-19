import { useState } from "react";

import { AdminShell } from "../components/AdminShell";
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
    <AdminShell title="Catalog · Brands">
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form
          onSubmit={add}
          className="flex items-end gap-2 rounded-md border border-neutral-200 bg-white p-3 shadow-sm"
        >
          <div className="flex-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              New brand
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Acer"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          >
            Add
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Slug</th>
                <th className="px-4 py-2 text-left font-medium">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isFetching && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                    Loading…
                  </td>
                </tr>
              )}
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                    No brands yet.
                  </td>
                </tr>
              )}
              {(data?.items ?? []).map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2 font-medium text-neutral-900">{b.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-neutral-500">{b.slug}</td>
                  <td className="px-4 py-2 text-xs text-neutral-500">
                    {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => rename(b.id)}
                      className="mr-1 rounded border border-neutral-300 px-2 py-1 text-xs"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => remove(b.id)}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
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
