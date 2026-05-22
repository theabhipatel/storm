import { Archive, RotateCcw, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AttributeEditor } from "../components/AttributeEditor";
import { MediaUploader } from "../components/MediaUploader";
import { AdminShell } from "../components/shell/AdminShell";
import { PageHeader } from "../components/shell/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
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

const inputCls =
  "block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

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
    <AdminShell>
      <PageHeader
        breadcrumbs={[
          { label: "Catalog" },
          { label: "Products", to: "/catalog/products" },
          { label: isNew ? "New product" : (product?.name ?? "Edit") },
        ]}
        title={isNew ? "New product" : (product?.name ?? "Edit product")}
        subtitle={!isNew && product ? `SKU ${product.sku}` : undefined}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/catalog/products")}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || isFetching}>
              {saving ? "Saving…" : isNew ? "Create draft" : "Save changes"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {!isNew && product && (
          <Card padding="md">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <StatusBadge status={product.status} />
              <span className="text-text-muted">
                {product.publishedAt
                  ? `Published ${new Date(product.publishedAt).toLocaleString("en-IN")}`
                  : "Not published"}
              </span>
              <div className="ml-auto flex flex-wrap gap-2">
                {product.status === "draft" && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={lifecycleBusy || !validation.canPublish}
                    title={
                      validation.canPublish
                        ? "Publish to customers"
                        : validation.reasons.join(" • ")
                    }
                    onClick={() => void onLifecycle("publish")}
                    leadingIcon={<Send className="h-3.5 w-3.5" aria-hidden />}
                  >
                    Publish
                  </Button>
                )}
                {product.status === "published" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={lifecycleBusy}
                    onClick={() => void onLifecycle("archive")}
                    leadingIcon={<Archive className="h-3.5 w-3.5" aria-hidden />}
                  >
                    Archive
                  </Button>
                )}
                {product.status === "archived" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={lifecycleBusy}
                    onClick={() => void onLifecycle("restore")}
                    leadingIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden />}
                  >
                    Restore to draft
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            {error}
          </div>
        )}

        {draftRestoredFromLocal && (
          <div className="rounded-md border border-warning/30 bg-warning-soft p-2 text-xs text-warning-foreground">
            Restored unsaved draft from this browser.
          </div>
        )}

        <Card padding="lg">
          <CardHeader title="Basics" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SmallField
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
            />
            <SmallField
              label="SKU"
              value={form.sku}
              onChange={(v) => setForm((f) => ({ ...f, sku: v.toUpperCase() }))}
              mono
              required
            />
            <SmallField
              label="Slug (auto from name if blank)"
              value={form.slug}
              onChange={(v) => setForm((f) => ({ ...f, slug: v }))}
              mono
            />
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                Price (paise)
              </label>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, basePrice: e.target.value }))
                }
                className={`mt-1 ${inputCls}`}
              />
              {form.basePrice && Number(form.basePrice) > 0 && (
                <p className="mt-1 text-xs text-text-subtle">
                  Display: {formatINR(Number(form.basePrice))}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                Brand
              </label>
              <select
                value={form.brandId}
                onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                className={`mt-1 ${inputCls}`}
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
              <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                className={`mt-1 ${inputCls}`}
              >
                <option value="">-- select --</option>
                {flatten(categories?.items ?? []).map(({ id: cid, label }) => (
                  <option key={cid} value={cid}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
              Description (Markdown)
            </label>
            <div className="mt-1 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={10}
                placeholder="# Heading&#10;- list item"
                className="block w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <div
                className="prose prose-sm h-full max-w-none overflow-auto rounded-md border border-border bg-surface-muted px-3 py-2 text-sm"
                aria-label="Markdown preview"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownPreview(
                    form.description || "*Preview will appear here.*",
                  ),
                }}
              />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader title="Attributes" description="Free-form key/value pairs (RAM, color, etc.)." />
          <AttributeEditor
            value={form.attributes}
            onChange={(next) => setForm((f) => ({ ...f, attributes: next }))}
          />
        </Card>

        {!isNew && product && (
          <>
            <Card padding="lg">
              <CardHeader title="Media" description="Drag to reorder; the primary image shows on listings." />
              <MediaUploader productId={product.id} media={product.media} />
            </Card>
            <Card padding="lg">
              <CardHeader title="Variants" description="Override SKU and price for product options." />
              <VariantEditor productId={product.id} variants={product.variants} />
            </Card>
          </>
        )}
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

function SmallField({
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
      <label className="text-xs font-medium uppercase tracking-wide text-text-subtle">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`mt-1 ${inputCls} ${mono ? "font-mono" : ""}`}
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
