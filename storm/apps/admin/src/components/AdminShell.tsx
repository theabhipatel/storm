import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

import { useCurrentUser, useLogout } from "../features/auth/auth.hooks";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/users", label: "Users" },
  { to: "/catalog/products", label: "Products" },
  { to: "/catalog/categories", label: "Categories" },
  { to: "/catalog/brands", label: "Brands" },
  { to: "/inventory", label: "Inventory" },
  { to: "/inventory/alerts", label: "Low stock" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const user = useCurrentUser();
  const [logout, { isLoading }] = useLogout();
  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-lg font-semibold text-neutral-900">
              Storm Admin
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    "rounded px-3 py-1.5 " +
                    (isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-100")
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
              <div className="font-medium text-neutral-900">{user?.name}</div>
              <div className="text-xs text-neutral-500">{user?.email}</div>
            </div>
            <button
              onClick={() => void logout()}
              disabled={isLoading}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
            >
              {isLoading ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-4 text-lg font-semibold text-neutral-900">{title}</h1>
        {children}
      </section>
    </main>
  );
}
