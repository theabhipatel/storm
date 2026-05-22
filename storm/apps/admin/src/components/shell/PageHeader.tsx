import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

export interface Breadcrumb {
  label: ReactNode;
  to?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
}: {
  breadcrumbs?: Breadcrumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="mb-2 flex items-center gap-1 text-xs text-text-subtle"
        >
          {breadcrumbs.map((c, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <Fragment key={i}>
                {c.to && !isLast ? (
                  <Link to={c.to} className="hover:text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-text-muted" : ""}>{c.label}</span>
                )}
                {!isLast ? (
                  <ChevronRight className="h-3 w-3 text-text-subtle" aria-hidden />
                ) : null}
              </Fragment>
            );
          })}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
