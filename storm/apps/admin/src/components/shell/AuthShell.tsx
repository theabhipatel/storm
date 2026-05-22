import { Boxes, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary-hover p-12 text-primary-foreground lg:flex lg:w-1/2 lg:flex-1">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/15 backdrop-blur-sm">
            <Boxes className="h-5 w-5" aria-hidden />
          </span>
          Storm Admin
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            The control plane for your storefront.
          </h2>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/80">
            Manage catalog, inventory, orders, and customers from one workspace.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
              Full-stack catalog management with media, variants, and attributes.
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
              Real-time inventory and low-stock alerts.
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
              Audited operator actions and order lifecycle controls.
            </li>
          </ul>
        </div>
        <div className="text-xs text-primary-foreground/70">
          &copy; {new Date().getFullYear()} Storm. All rights reserved.
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary lg:hidden">
            Storm Admin
          </div>
          <h1 className="text-2xl font-semibold text-text">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
