import { ChevronRight } from "lucide-react";
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
    <main className="bg-bg pb-10">
      <div className="bg-surface shadow-sm">
        <div className="mx-auto max-w-page px-4 py-5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-2 text-xs text-text-muted">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              {listing.breadcrumb.map((b, i) => (
                <li key={b.id} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-text-subtle" />
                  {i === listing.breadcrumb.length - 1 ? (
                    <span className="font-medium text-text">{b.name}</span>
                  ) : (
                    <Link href={`/c/${b.slug}`} className="hover:text-primary">
                      {b.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="text-2xl font-bold text-text sm:text-3xl">
            {listing.category.name}
          </h1>

          {listing.subcategories.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {listing.subcategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/c/${c.slug}`}
                    className="inline-flex items-center rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-text hover:border-primary hover:text-primary"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8">
        <ProductListing
          initial={listing.results}
          forcedCategoryId={listing.category.id}
          surface="category"
        />
      </div>
    </main>
  );
}
