import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HomeBanner() {
  return (
    <section className="overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-hover to-primary text-primary-foreground shadow-card">
      <div className="relative grid gap-6 px-6 py-8 sm:grid-cols-2 sm:items-center sm:px-10 sm:py-12">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            New on Storm
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            Everyday essentials,
            <br />
            delivered fast.
          </h1>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/90 sm:text-base">
            Discover top brands and curated picks across categories — fresh
            deals every day.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-card transition hover:bg-white/95"
          >
            Start shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative hidden h-40 sm:block">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-12 bottom-0 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute right-2 top-4 grid grid-cols-2 gap-3">
            <BannerTile delay={0} />
            <BannerTile delay={100} />
            <BannerTile delay={200} />
            <BannerTile delay={300} />
          </div>
        </div>
      </div>
    </section>
  );
}

function BannerTile({ delay }: { delay: number }) {
  return (
    <div
      className="h-16 w-16 rounded-lg bg-white/15 backdrop-blur"
      style={{ animation: `pulse 4s ease-in-out ${delay}ms infinite` }}
    />
  );
}
