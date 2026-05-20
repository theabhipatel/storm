import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  secondary,
  children,
}: {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondary?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-md border border-dashed border-neutral-300 bg-white p-8 text-center">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      ) : null}
      {children}
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {ctaLabel}
        </Link>
      ) : null}
      {secondary ? <div className="mt-3">{secondary}</div> : null}
    </div>
  );
}
