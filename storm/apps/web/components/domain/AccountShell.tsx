"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import {
  useAuthBootstrapped,
  useCurrentUser,
  useLogout,
} from "../../features/auth/auth.hooks";

const NAV_ITEMS = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/change-password", label: "Password" },
  { href: "/account/delete", label: "Delete account" },
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

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            Storm
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="text-sm text-neutral-700 underline-offset-2 hover:underline"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "block rounded-md px-3 py-2 text-sm " +
                  (active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
