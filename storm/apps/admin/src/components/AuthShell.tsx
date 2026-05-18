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
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-widest text-neutral-500">Storm Admin</div>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
