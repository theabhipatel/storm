import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { AttributeEditor } from "../components/AttributeEditor";
import { MediaUploader } from "../components/MediaUploader";
import { StatusBadge } from "../components/StatusBadge";
import { VariantEditor } from "../components/VariantEditor";
import {
  useArchiveProductMutation,
  useCreateProductMutation,
  useGetProductQuery,
  useListBrandsQuery,
  useListCategoryTreeQuery,
  usePublishProductMutation,
  useRestoreProductMutation,
  useUpdateProductMutation,
  type CategoryTreeNode,
  type ProductDetail,
} from "../features/catalog/catalog.api";
import { formatINR } from "../lib/format";
import { renderMarkdownPreview } from "../lib/markdown";

interface FormState {
  sku: string;
  slug: string;
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  basePrice: string;
  attributes: Record<string, string | number | boolean>;
}

const EMPTY: FormState = {
  sku: "",
  slug: "",
  name: "",
  description: "",
  brandId: "",
  categoryId: "",
  basePrice: "",
  attributes: {},
};

export function CatalogProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { data: brands } = useListBrandsQuery();
  const { data: categories } = useListCategoryTreeQuery();
  const { data: product, isFetching } = useGetProductQuery(id!, { skip: isNew });

  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();
  const [publishProduct, pubState] = usePublishProductMutation();
  const [archiveProduct, arcState] = useArchiveProductMutation();
  const [restoreProduct, resState] = useRestoreProductMutation();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [draftRestoredFromLocal, setDraftRestoredFromLocal] = useState(false);
  const draftKey = `catalog-product-draft:${id ?? "new"}`;

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        description: product.description,
        brandId: product.brandId,
        categoryId: product.categoryId,
        basePrice: String(product.basePrice),
        attributes: product.attributes,
      });
    }
  }, [product]);

  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (raw && isNew) {
      try {
        const parsed = JSON.parse(raw) as FormState;
        setForm(parsed);
        setDraftRestoredFromLocal(true);
      } catch {
        /* ignore */
      }
    }
  }, [draftKey, isNew]);

  useEffect(() => {
    if (!isNew) return;
    const t = setInterval(() => {
      localStorage.setItem(draftKey, JSON.stringify(form));
    }, 10_000);
    return () => clearInterval(t);
  }, [draftKey, form, isNew]);

  const validation = useMemo(() => validatePublish(product, form), [product, form]);

  async function save() {
    setError(null);
    try {
      const basePrice = Number(form.basePrice);
      if (isNew) {
        const created = await createProduct({
          sku: form.sku,
          ...(form.slug ? { slug: form.slug } : {}),
          name: form.name,
          description: form.description,
          brandId: form.brandId,
          categoryId: form.categoryId,
          basePrice,
          attributes: form.attributes,
        }).unwrap();
        localStorage.removeItem(draftKey);
        navigate(`/catalog/products/${created.id}`);
      } else {
        await updateProduct({
          id: id!,
          data: {
            sku: form.sku,
            slug: form.slug,
            name: form.name,
            description: form.description,
            brandId: form.brandId,
            categoryId: form.categoryId,
            basePrice,
            attributes: form.attributes,
          },
        }).unwrap();
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      setError(asMessage(err));
    }
  }

  async function onLifecycle(action: "publish" | "archive" | "restore") {
    setError(null);
    try {
      if (action === "publish") await publishProduct(id!).unwrap();
      if (action === "archive") await archiveProduct(id!).unwrap();
      if (action === "restore") await restoreProduct(id!).unwrap();
    } catch (err) {
      setError(asMessage(err));
    }
  }

  const saving = createState.isLoading || updateState.isLoading;
  const lifecycleBusy = pubState.isLoading || arcState.isLoading || resState.isLoading;

  return (
    <AdminShell title={isNew ? "Catalog · New product" : `Catalog · ${product?.name ?? "Product"}`}>
      <div className="space-y-6">
        {!isNew && product && (
          <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-white p-3 text-sm">
            <StatusBadge status={product.status} />
            <span className="text-neutral-600">
              {product.publishedAt
                ? `Published ${new Date(product.publishedAt).toLocaleString("en-IN")}`
                : "Not published"}
            </span>
            <div className="ml-auto flex gap-2">
              {product.status === "draft" && (
                <button
                  type="button"
                  disabled={lifecycleBusy || !validation.canPublish}
                  title={
                    validation.canPublish
                      ? "Publish to customers"
                      : validation.reasons.join(" • ")
                  }
                  onClick={() => void onLifecycle("publish")}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  Publish
                </button>
              )}
              {product.status === "published" && (
                <button
                  type="button"
                  disabled={lifecycleBusy}
                  onClick={() => void onLifecycle("archive")}
                  className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 disabled:opacity-50"
                >
                  Archive
                </button>
              )}
              {product.status === "archived" && (
                <button
                  type="button"
                  disabled={lifecycleBusy}
                  onClick={() => void onLifecycle("restore")}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 disabled:opacity-50"
                >
                  Restore to draft
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {draftRestoredFromLocal && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            Restored unsaved draft from this browser.
          </div>
        )}

        {/* Basics */}
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900">Basics</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
            />
            <Field
              label="SKU"
              value={form.sku}
              onChange={(v) => setForm((f) => ({ ...f, sku: v.toUpperCase() }))}
              mono
              required
            />
            <Field
              label="Slug (auto from name if blank)"
              value={form.slug}
              onChange={(v) => setForm((f) => ({ ...f, slug: v }))}
              mono
            />
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Price (paise)
              </label>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              {form.basePrice && Number(form.basePrice) > 0 && (
                <p className="mt-1 text-xs text-neutral-500">
                  Display: {formatINR(Number(form.basePrice))}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Brand
              </label>
              <select
                value={form.brandId}
                onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">-- select --</option>
                {(brands?.items ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">-- select --</option>
                {flatten(categories?.items ?? []).map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Description (Markdown)
            </label>
            <div className="mt-1 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={10}
                placeholder="# Heading&#10;- list item"
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm"
              />
              <div
                className="prose prose-sm h-full max-w-none overflow-auto rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                aria-label="Markdown preview"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownPreview(form.description || "*Preview will appear here.*"),
                }}
              />
            </div>
          </div>
        </section>

        {/* Attributes */}
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">Attributes</h2>
          <AttributeEditor
            value={form.attributes}
            onChange={(next) => setForm((f) => ({ ...f, attributes: next }))}
          />
        </section>

        {/* Media + variants only on existing products (need an id). */}
        {!isNew && product && (
          <>
            <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">Media</h2>
              <MediaUploader productId={product.id} media={product.media} />
            </section>
            <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">Variants</h2>
              <VariantEditor productId={product.id} variants={product.variants} />
            </section>
          </>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || isFetching}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : isNew ? "Create draft" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/catalog/products")}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

function flatten(
  nodes: CategoryTreeNode[],
  depth = 0,
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const n of nodes) {
    out.push({ id: n.id, label: `${"—".repeat(depth)} ${n.name}`.trim() });
    out.push(...flatten(n.children, depth + 1));
  }
  return out;
}

function Field({
  label,
  value,
  onChange,
  required,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={
          "mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm " +
          (mono ? "font-mono" : "")
        }
      />
    </div>
  );
}

function validatePublish(product: ProductDetail | undefined, form: FormState) {
  const reasons: string[] = [];
  const price = Number(form.basePrice);
  const hasPrice = !Number.isNaN(price) && price > 0;
  const hasMedia = (product?.media ?? []).length > 0;
  if (!hasPrice) reasons.push("Set a price > 0");
  if (!hasMedia) reasons.push("Add at least one image");
  return { canPublish: reasons.length === 0, reasons };
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
