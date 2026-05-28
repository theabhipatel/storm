import {
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "../../../components/domain/ProductGallery";
import { VariantSelector } from "../../../components/domain/VariantSelector";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { PriceBlock } from "../../../components/ui/PriceBlock";
import { AddToCartButton } from "../../../features/cart/AddToCartButton";
import { ProductRecsWidget } from "../../../features/recs/ProductRecsWidget";
import { renderMarkdownSafe } from "../../../lib/markdown";
import { fetchProductBySlug } from "../../../lib/serverFetch";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — Storm`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) notFound();

  const description = renderMarkdownSafe(product.description);
  const attributes = Object.entries(product.attributes ?? {});

  return (
    <main className="bg-bg pb-12">
      <div className="mx-auto max-w-page px-4 py-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            {product.breadcrumb.map((b) => (
              <li key={b.id} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-text-subtle" />
                <span className="text-text">{b.name}</span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-8">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card padding="md" className="lg:p-4">
              <ProductGallery assets={product.mediaAssets} fallbackSeed={params.slug} />
            </Card>
          </div>

          <div>
            <Card padding="lg" className="space-y-5">
              {product.brand ? (
                <Link
                  href={`/search?brandId=${product.brand.id}`}
                  className="inline-block text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  {product.brand.name}
                </Link>
              ) : null}
              <h1 className="text-2xl font-semibold leading-tight text-text sm:text-3xl">
                {product.name}
              </h1>

              <div className="space-y-1">
                <PriceBlock
                  price={product.basePrice}
                  currency={product.currency}
                  size="xl"
                />
                <p className="text-xs text-text-subtle">Inclusive of all taxes</p>
              </div>

              <VariantSelector
                variants={product.variants}
                basePrice={product.basePrice}
                currency={product.currency}
              />

              {product.stock.inStock ? (
                <div className="inline-flex items-center gap-2 rounded-md bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  In stock — usually ships within 3 business days
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-md bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger">
                  <XCircle className="h-4 w-4" />
                  Out of stock right now
                </div>
              )}

              <AddToCartButton
                productId={product.id}
                sku={product.sku}
                slug={product.slug}
                name={product.name}
                basePrice={product.basePrice}
                inStock={product.stock.inStock}
              />

              <ul className="grid grid-cols-1 gap-3 border-t border-border pt-5 text-sm text-text sm:grid-cols-2">
                <InfoRow
                  icon={<Truck className="h-4 w-4 text-primary" />}
                  title="Free delivery"
                  detail="Orders above ₹499"
                />
                <InfoRow
                  icon={<RotateCcw className="h-4 w-4 text-primary" />}
                  title="Easy returns"
                  detail="7-day return window"
                />
                <InfoRow
                  icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                  title="Secure payments"
                  detail="100% protected"
                />
                <InfoRow
                  icon={<PackageCheck className="h-4 w-4 text-primary" />}
                  title="Genuine product"
                  detail="Sourced from brand"
                />
              </ul>
            </Card>

            {attributes.length > 0 ? (
              <Card padding="lg" className="mt-4">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-text">
                  Specifications
                  <Badge variant="primary" size="sm">
                    {attributes.length}
                  </Badge>
                </h2>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {attributes.map(([k, v]) => (
                      <tr key={k}>
                        <th className="w-1/3 py-2 pr-3 text-left font-medium text-text-muted">
                          {k}
                        </th>
                        <td className="py-2 text-text">{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : null}

            {description ? (
              <Card padding="lg" className="mt-4">
                <h2 className="mb-3 text-base font-semibold text-text">
                  About this product
                </h2>
                <div
                  className="prose prose-sm max-w-none text-text"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </Card>
            ) : null}
          </div>
        </div>

        <section className="mt-8">
          <ProductRecsWidget productId={product.id} />
        </section>
      </div>
    </main>
  );
}

function InfoRow({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-text">{title}</p>
        <p className="text-xs text-text-muted">{detail}</p>
      </div>
    </li>
  );
}
