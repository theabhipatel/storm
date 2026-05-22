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
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-subtle">
            <tr>
              <th className="px-3 py-2 text-left font-medium">SKU</th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Price (paise)</th>
              <th className="px-3 py-2 text-left font-medium">Display</th>
              <th className="w-24 px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {variants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-text-subtle">
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
        className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border p-3"
      >
        <div className="min-w-[140px] flex-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            SKU
          </label>
          <input
            value={draft.sku}
            onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="ACER-ASP5-16GB"
            required
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            Name
          </label>
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="16GB / 512GB"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            Price
          </label>
          <input
            type="number"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            className="mt-1 block w-32 rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="inherit"
          />
        </div>
        <button
          type="submit"
          disabled={addState.isLoading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
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
        <td className="px-3 py-2 font-mono text-xs text-text">{variant.sku}</td>
        <td className="px-3 py-2 text-text">{variant.name}</td>
        <td className="px-3 py-2 text-text">
          {variant.price ?? <em className="text-text-subtle">inherit</em>}
        </td>
        <td className="px-3 py-2 text-text">
          {variant.price !== null ? formatINR(variant.price) : "—"}
        </td>
        <td className="px-3 py-2 text-right">
          <button
            onClick={() => setEditing(true)}
            className="mr-1 rounded border border-border bg-surface px-2 py-1 text-xs text-text transition hover:bg-surface-muted"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Delete variant?")) void onDelete();
            }}
            className="rounded border border-danger/40 px-2 py-1 text-xs text-danger transition hover:bg-danger-soft"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
  const editInputCls =
    "rounded-md border border-border bg-surface px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";
  return (
    <tr className="bg-surface-muted">
      <td className="px-3 py-2">
        <input
          value={form.sku}
          onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          className={`w-36 ${editInputCls}`}
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={`w-full ${editInputCls}`}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className={`w-28 ${editInputCls}`}
          placeholder="inherit"
        />
      </td>
      <td className="px-3 py-2 text-text">
        {form.price ? formatINR(Number(form.price)) : "—"}
      </td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={() => void save()}
          className="mr-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded border border-border bg-surface px-2 py-1 text-xs text-text hover:bg-surface-muted"
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}
