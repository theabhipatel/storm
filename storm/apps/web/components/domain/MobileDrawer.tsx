"use client";

import {
  Heart,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useCurrentUser, useLogout } from "../../features/auth/auth.hooks";

interface SimpleCategory {
  id: string;
  name: string;
  slug: string;
}

export function MobileDrawer({ categories }: { categories: SimpleCategory[] }) {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();
  const [logout] = useLogout();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-primary-foreground hover:bg-white/10 md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="storm-mobile-drawer"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open ? (
        <div
          id="storm-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 cursor-default bg-overlay/50"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-surface shadow-elevated">
            <div className="flex items-center justify-between bg-primary px-4 py-4 text-primary-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">
                  {user ? "Welcome back" : "Welcome to"}
                </p>
                <p className="text-lg font-bold">
                  {user ? user.name : "Storm"}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-1.5 text-primary-foreground hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              <DrawerSection>
                <DrawerLink href="/" icon={<Home className="h-4 w-4" />} onClick={close}>
                  Home
                </DrawerLink>
                <DrawerLink
                  href="/search"
                  icon={<LayoutGrid className="h-4 w-4" />}
                  onClick={close}
                >
                  All products
                </DrawerLink>
                <DrawerLink
                  href="/cart"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  onClick={close}
                >
                  Cart
                </DrawerLink>
                <DrawerLink
                  href="/wishlist"
                  icon={<Heart className="h-4 w-4" />}
                  onClick={close}
                >
                  Wishlist
                </DrawerLink>
              </DrawerSection>

              {categories.length > 0 ? (
                <DrawerSection title="Categories">
                  {categories.map((c) => (
                    <DrawerLink key={c.id} href={`/c/${c.slug}`} onClick={close}>
                      {c.name}
                    </DrawerLink>
                  ))}
                </DrawerSection>
              ) : null}

              <DrawerSection title="Account">
                {user ? (
                  <>
                    <DrawerLink
                      href="/account"
                      icon={<User className="h-4 w-4" />}
                      onClick={close}
                    >
                      My account
                    </DrawerLink>
                    <DrawerLink
                      href="/orders"
                      icon={<Package className="h-4 w-4" />}
                      onClick={close}
                    >
                      My orders
                    </DrawerLink>
                    <button
                      type="button"
                      onClick={() => {
                        void logout();
                        close();
                      }}
                      className="flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-muted"
                    >
                      <LogOut className="h-4 w-4 text-text-subtle" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <DrawerLink
                      href="/auth/login"
                      icon={<LogIn className="h-4 w-4" />}
                      onClick={close}
                    >
                      Log in
                    </DrawerLink>
                    <DrawerLink href="/auth/signup" onClick={close}>
                      Sign up
                    </DrawerLink>
                  </>
                )}
              </DrawerSection>

              <DrawerSection title="More">
                <DrawerLink href="/about" onClick={close}>
                  About
                </DrawerLink>
                <DrawerLink href="/contact" onClick={close}>
                  Contact
                </DrawerLink>
                <DrawerLink href="/faq" onClick={close}>
                  FAQ
                </DrawerLink>
              </DrawerSection>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function DrawerSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border py-2 last:border-b-0">
      {title ? (
        <h3 className="px-5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
          {title}
        </h3>
      ) : null}
      <ul>{children}</ul>
    </div>
  );
}

function DrawerLink({
  href,
  children,
  icon,
  onClick,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-muted"
      >
        {icon ? <span className="text-text-subtle">{icon}</span> : null}
        {children}
      </Link>
    </li>
  );
}
