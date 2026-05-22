import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 block text-center text-2xl font-bold tracking-tight text-primary"
        >
          Storm
        </Link>
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-elevated">
          <div className="h-1.5 bg-primary" aria-hidden="true" />
          <div className="p-6 sm:p-8">
            <h1 className="text-xl font-semibold text-text sm:text-2xl">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
            ) : null}
            <div className="mt-6">{children}</div>
          </div>
          {footer ? (
            <div className="border-t border-border bg-surface-muted px-6 py-4 text-center text-sm text-text-muted">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
