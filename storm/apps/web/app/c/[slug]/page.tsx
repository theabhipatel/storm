import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductListing } from "../../../components/domain/ProductListing";
import { fetchCategoryListing } from "../../../lib/serverFetch";

export const revalidate = 60;

interface PageParams {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const listing = await fetchCategoryListing(params.slug, {}).catch(() => null);
  if (!listing) return { title: "Category" };
  return {
    title: `${listing.category.name} — Storm`,
    description: `Browse ${listing.category.name} on Storm.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageParams) {
  const listing = await fetchCategoryListing(params.slug, searchParams);
  if (!listing) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          {listing.breadcrumb.map((b, i) => (
            <li key={b.id} className="flex items-center gap-1">
              <span>/</span>
              {i === listing.breadcrumb.length - 1 ? (
                <span className="text-neutral-900">{b.name}</span>
              ) : (
                <Link href={`/c/${b.slug}`} className="hover:underline">
                  {b.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <h1 className="text-2xl font-semibold text-neutral-900">{listing.category.name}</h1>

      {listing.subcategories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {listing.subcategories.map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.slug}`}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-300"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <ProductListing
          initial={listing.results}
          forcedCategoryId={listing.category.id}
          surface="category"
        />
      </div>
    </main>
  );
}
