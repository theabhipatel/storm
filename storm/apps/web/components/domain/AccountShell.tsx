"use client";

import {
  Bell,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Trash2,
  User,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import {
  useAuthBootstrapped,
  useCurrentUser,
  useLogout,
} from "../../features/auth/auth.hooks";

const NAV_ITEMS = [
  { href: "/account", label: "Overview", icon: <User className="h-4 w-4" /> },
  { href: "/orders", label: "My Orders", icon: <Package className="h-4 w-4" /> },
  { href: "/account/profile", label: "Profile", icon: <UserCircle className="h-4 w-4" /> },
  { href: "/account/addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { href: "/account/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { href: "/account/change-password", label: "Password", icon: <KeyRound className="h-4 w-4" /> },
  { href: "/account/delete", label: "Delete account", icon: <Trash2 className="h-4 w-4" /> },
];

export function AccountShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const bootstrapped = useAuthBootstrapped();
  const user = useCurrentUser();
  const [logout] = useLogout();

  useEffect(() => {
    if (bootstrapped && !user) router.replace("/auth/login");
  }, [bootstrapped, user, router]);

  if (!user) return null;

  const initial = user.name?.[0]?.toUpperCase() ?? "?";

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto grid max-w-page gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-text-subtle">
                  Hello,
                </p>
                <p className="truncate text-sm font-semibold text-text">{user.name}</p>
              </div>
            </div>
          </div>

          <nav
            aria-label="Account navigation"
            className="overflow-hidden rounded-lg border border-border bg-surface shadow-card"
          >
            <ul>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition ${
                        active
                          ? "border-primary bg-primary-soft font-semibold text-primary"
                          : "border-transparent text-text hover:bg-surface-muted"
                      }`}
                    >
                      <span className={active ? "text-primary" : "text-text-subtle"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="border-t border-border">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-muted"
                >
                  <LogOut className="h-4 w-4 text-text-subtle" />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h1 className="text-xl font-semibold text-text sm:text-2xl">{title}</h1>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
