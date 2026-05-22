import { PackageOpen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  icon,
  secondary,
  children,
}: {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: ReactNode;
  secondary?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-lg border border-border bg-surface p-10 text-center shadow-card">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon ?? <PackageOpen className="h-8 w-8" aria-hidden="true" />}
      </div>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {description ? (
        <p className="mt-1.5 text-sm text-text-muted">{description}</p>
      ) : null}
      {children}
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
        >
          {ctaLabel}
        </Link>
      ) : null}
      {secondary ? <div className="mt-3 text-sm text-text-muted">{secondary}</div> : null}
    </div>
  );
}
