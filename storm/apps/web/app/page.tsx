import Link from "next/link";

import { ProductCard } from "../components/domain/ProductCard";
import { fetchHome } from "../lib/serverFetch";

// Server-rendered per request — the 30s cache lives in web-bff.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await fetchHome();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 p-8 text-white shadow-sm sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
          Storm
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Everyday essentials, delivered fast.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-200">
          Discover top brands and curated picks across all categories.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
        >
          Start shopping
        </Link>
      </section>

      <section className="mt-10">
        <SectionHeader title="Shop by category" />
        {home.topCategories.length === 0 ? (
          <EmptyHint>No categories published yet.</EmptyHint>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {home.topCategories.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="flex flex-col items-center gap-2 rounded-md border border-neutral-200 bg-white p-4 text-center text-sm font-medium text-neutral-700 hover:border-neutral-300 hover:text-neutral-900"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-base font-semibold uppercase text-neutral-600">
                  {c.name.charAt(0)}
                </span>
                <span className="line-clamp-2">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <SectionHeader title="Top sellers" linkHref="/search?sort=popularity" linkLabel="See all" />
        {home.topSellers.length === 0 ? (
          <EmptyHint>No products yet. Check back soon.</EmptyHint>
        ) : (
          <div className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-2">
            {home.topSellers.map((h) => (
              <div key={h.productId} className="w-44 flex-shrink-0 snap-start sm:w-56">
                <ProductCard hit={h} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 mb-10">
        <SectionHeader title="Featured brands" />
        {home.featuredBrands.length === 0 ? (
          <EmptyHint>No brands featured yet.</EmptyHint>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {home.featuredBrands.map((b) => (
              <Link
                key={b.id}
                href={`/search?brandId=${b.id}`}
                className="rounded-md border border-neutral-200 bg-white p-6 text-center text-sm font-semibold text-neutral-800 hover:border-neutral-300"
              >
                {b.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SectionHeader({
  title,
  linkHref,
  linkLabel,
}: {
  title: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {linkHref && linkLabel ? (
        <Link
          href={linkHref}
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
      {children}
    </div>
  );
}
