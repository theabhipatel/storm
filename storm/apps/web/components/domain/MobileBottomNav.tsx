"use client";

import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useCart } from "../../features/cart/useCart";

interface Tab {
  href: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
}

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="h-5 w-5" />,
    match: (p) => p === "/",
  },
  {
    href: "/search",
    label: "Categories",
    icon: <LayoutGrid className="h-5 w-5" />,
    match: (p) => p === "/search" || p.startsWith("/c/"),
  },
  {
    href: "/cart",
    label: "Cart",
    icon: <ShoppingCart className="h-5 w-5" />,
    match: (p) => p.startsWith("/cart"),
  },
  {
    href: "/account",
    label: "Account",
    icon: <User className="h-5 w-5" />,
    match: (p) => p.startsWith("/account") || p.startsWith("/orders"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const { itemCount } = useCart();

  if (pathname.startsWith("/auth") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const showBadge = tab.href === "/cart" && itemCount > 0;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-2.5 text-[11px] font-medium transition ${
                  active ? "text-primary" : "text-text-muted"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative inline-flex">
                  {tab.icon}
                  {showBadge ? (
                    <span className="absolute -right-2 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  ) : null}
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
