import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "../../../components/domain/ProductGallery";
import { VariantSelector } from "../../../components/domain/VariantSelector";
import { formatINR } from "../../../lib/format";
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          {product.breadcrumb.map((b) => (
            <li key={b.id} className="flex items-center gap-1">
              <span>/</span>
              <span>{b.name}</span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery assets={product.mediaAssets} />

        <div className="space-y-5">
          {product.brand && (
            <p className="text-sm font-medium text-neutral-500">
              <Link
                href={`/b/${product.brand.slug}`}
                className="hover:text-neutral-900 hover:underline"
              >
                {product.brand.name}
              </Link>
            </p>
          )}
          <h1 className="text-3xl font-semibold text-neutral-900">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">
              {formatINR(product.basePrice, product.currency)}
            </span>
            <span className="text-xs text-neutral-500">inclusive of taxes</span>
          </div>

          <VariantSelector
            variants={product.variants}
            basePrice={product.basePrice}
            currency={product.currency}
          />

          {/* Stock signal — wired on Day 6 when inventory-service comes online. */}
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Live stock + delivery estimates arrive in Day 6.
          </div>

          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white opacity-60"
            title="Cart wiring lands on Day 6"
          >
            Add to cart (coming soon)
          </button>

          {attributes.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">
                Specifications
              </h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-neutral-100">
                  {attributes.map(([k, v]) => (
                    <tr key={k}>
                      <th className="w-1/3 py-1.5 text-left font-medium text-neutral-600">
                        {k}
                      </th>
                      <td className="py-1.5 text-neutral-900">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>

      {description && (
        <section className="mt-10">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">
            About this product
          </h2>
          <div
            className="prose prose-sm max-w-none text-neutral-800"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-2 text-base font-semibold text-neutral-900">
          You might also like
        </h2>
        <div className="rounded-md border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
          Recommendations arrive in Day 6 once recommendation-service is wired.
        </div>
      </section>
    </main>
  );
}
