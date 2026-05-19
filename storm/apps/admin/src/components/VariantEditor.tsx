import { useState } from "react";

import type { VariantDto } from "../features/catalog/catalog.api";
import {
  useAddVariantMutation,
  useDeleteVariantMutation,
  useUpdateVariantMutation,
} from "../features/catalog/catalog.api";
import { formatINR } from "../lib/format";

export function VariantEditor({
  productId,
  variants,
}: {
  productId: string;
  variants: VariantDto[];
}) {
  const [addVariant, addState] = useAddVariantMutation();
  const [updateVariant] = useUpdateVariantMutation();
  const [deleteVariant] = useDeleteVariantMutation();

  const [draft, setDraft] = useState({ sku: "", name: "", price: "" });

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.sku || !draft.name) return;
    const price = draft.price.trim() ? Number(draft.price) : null;
    await addVariant({
      productId,
      data: { sku: draft.sku, name: draft.name, price },
    }).unwrap();
    setDraft({ sku: "", name: "", price: "" });
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">SKU</th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Price (paise)</th>
              <th className="px-3 py-2 text-left font-medium">Display</th>
              <th className="px-3 py-2 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {variants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-neutral-500">
                  No variants yet.
                </td>
              </tr>
            )}
            {variants.map((v) => (
              <VariantRow
                key={v.id}
                productId={productId}
                variant={v}
                onUpdate={(data) =>
                  updateVariant({ productId, variantId: v.id, data }).unwrap()
                }
                onDelete={() =>
                  deleteVariant({ productId, variantId: v.id }).unwrap()
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={onAdd}
        className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-neutral-300 p-3"
      >
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            SKU
          </label>
          <input
            value={draft.sku}
            onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            placeholder="ACER-ASP5-16GB"
            required
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Name
          </label>
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            placeholder="16GB / 512GB"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Price
          </label>
          <input
            type="number"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className="mt-1 block w-32 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            placeholder="inherit"
          />
        </div>
        <button
          type="submit"
          disabled={addState.isLoading}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Add variant
        </button>
      </form>
    </div>
  );
}

function VariantRow({
  variant,
  onUpdate,
  onDelete,
}: {
  productId: string;
  variant: VariantDto;
  onUpdate: (data: Partial<{ sku: string; name: string; price: number | null }>) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    sku: variant.sku,
    name: variant.name,
    price: variant.price?.toString() ?? "",
  });

  async function save() {
    const data: { sku: string; name: string; price: number | null } = {
      sku: form.sku,
      name: form.name,
      price: form.price.trim() ? Number(form.price) : null,
    };
    await onUpdate(data);
    setEditing(false);
  }

  if (!editing) {
    return (
      <tr>
        <td className="px-3 py-2 font-mono text-xs">{variant.sku}</td>
        <td className="px-3 py-2">{variant.name}</td>
        <td className="px-3 py-2">{variant.price ?? <em className="text-neutral-400">inherit</em>}</td>
        <td className="px-3 py-2">{variant.price !== null ? formatINR(variant.price) : "—"}</td>
        <td className="px-3 py-2 text-right">
          <button
            onClick={() => setEditing(true)}
            className="mr-1 rounded border border-neutral-300 px-2 py-1 text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Delete variant?")) void onDelete();
            }}
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
  return (
    <tr className="bg-neutral-50">
      <td className="px-3 py-2">
        <input
          value={form.sku}
          onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          className="w-36 rounded-md border border-neutral-300 px-2 py-1 text-xs"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-xs"
          placeholder="inherit"
        />
      </td>
      <td className="px-3 py-2">{form.price ? formatINR(Number(form.price)) : "—"}</td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={() => void save()}
          className="mr-1 rounded bg-neutral-900 px-2 py-1 text-xs text-white"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded border border-neutral-300 px-2 py-1 text-xs"
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}
