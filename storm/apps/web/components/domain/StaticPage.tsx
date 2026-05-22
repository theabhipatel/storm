import type { ReactNode } from "react";

export function StaticPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-bg pb-12">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-page px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/90 sm:text-base">
              {intro}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="prose prose-sm max-w-none text-text [&_a]:text-primary [&_a:hover]:text-primary-hover [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-text [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text [&_li]:text-text [&_p]:text-text [&_strong]:text-text">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export function PlaceholderNotice({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-md border border-warning/30 bg-warning-soft p-4 text-sm text-warning-foreground">
      {children}
    </div>
  );
}
