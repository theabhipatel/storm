import { Layers } from "lucide-react";
import Link from "next/link";

import { HomeBanner } from "../components/domain/HomeBanner";
import { ProductCard } from "../components/domain/ProductCard";
import { Rail } from "../components/ui/Rail";
import { fetchHome } from "../lib/serverFetch";

// Server-rendered per request — the 30s cache lives in web-bff.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await fetchHome();

  return (
    <main className="bg-bg pb-10">
      <div className="mx-auto max-w-page px-4 pt-4 sm:px-6 lg:px-8">
        <HomeBanner />
      </div>

      <section className="mx-auto mt-6 max-w-page px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Shop by category"
          linkHref="/search"
          linkLabel="Explore all"
        />
        {home.topCategories.length === 0 ? (
          <EmptyHint>No categories published yet.</EmptyHint>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {home.topCategories.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-center text-sm font-medium text-text shadow-card transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-lg font-bold uppercase text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  {c.name.charAt(0)}
                </span>
                <span className="line-clamp-2 leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto mt-6 max-w-page px-4 sm:px-6 lg:px-8">
        {home.topSellers.length === 0 ? (
          <div className="rounded-lg bg-surface px-4 py-6 shadow-card">
            <h2 className="text-lg font-semibold text-text">Top sellers</h2>
            <EmptyHint>No products yet. Check back soon.</EmptyHint>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg shadow-card">
            <Rail
              title="Top sellers"
              subtitle="Most loved by Storm shoppers"
              seeAllHref="/search?sort=popularity"
            >
              {home.topSellers.map((h) => (
                <div
                  key={h.productId}
                  className="w-44 flex-shrink-0 snap-start sm:w-56"
                >
                  <ProductCard hit={h} />
                </div>
              ))}
            </Rail>
          </div>
        )}
      </div>

      <section className="mx-auto mt-6 max-w-page px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Featured brands" />
        {home.featuredBrands.length === 0 ? (
          <EmptyHint>No brands featured yet.</EmptyHint>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {home.featuredBrands.map((b) => (
              <Link
                key={b.id}
                href={`/search?brandId=${b.id}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-5 text-center text-sm font-semibold text-text shadow-card transition hover:border-primary/50 hover:text-primary"
              >
                <Layers className="h-4 w-4 text-text-subtle" />
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
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-semibold text-text sm:text-xl">{title}</h2>
      {linkHref && linkLabel ? (
        <Link
          href={linkHref}
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-sm text-text-muted">
      {children}
    </div>
  );
}
