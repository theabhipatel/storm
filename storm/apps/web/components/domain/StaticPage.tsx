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
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>
      {intro ? <p className="mt-2 text-sm text-neutral-600">{intro}</p> : null}
      <div className="prose prose-neutral mt-8 max-w-none text-sm leading-6 text-neutral-700">
        {children}
      </div>
    </main>
  );
}

export function PlaceholderNotice({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      {children}
    </div>
  );
}
