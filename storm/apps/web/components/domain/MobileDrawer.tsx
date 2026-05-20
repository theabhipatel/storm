"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCurrentUser } from "../../features/auth/auth.hooks";

interface SimpleCategory {
  id: string;
  name: string;
  slug: string;
}

export function MobileDrawer({ categories }: { categories: SimpleCategory[] }) {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="storm-mobile-drawer"
      >
        <span aria-hidden="true" className="block h-0.5 w-5 bg-current shadow-[0_-6px_0_currentColor,0_6px_0_currentColor]" />
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
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-neutral-900/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[80%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <span className="text-base font-semibold text-neutral-900">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="space-y-1 text-sm">
                <DrawerLink href="/" onNavigate={() => setOpen(false)}>
                  Home
                </DrawerLink>
                <DrawerLink href="/search" onNavigate={() => setOpen(false)}>
                  All products
                </DrawerLink>
                <DrawerLink href="/cart" onNavigate={() => setOpen(false)}>
                  Cart
                </DrawerLink>
                <DrawerLink href="/wishlist" onNavigate={() => setOpen(false)}>
                  Wishlist
                </DrawerLink>
              </ul>

              {categories.length > 0 ? (
                <>
                  <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Categories
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {categories.map((c) => (
                      <DrawerLink
                        key={c.id}
                        href={`/c/${c.slug}`}
                        onNavigate={() => setOpen(false)}
                      >
                        {c.name}
                      </DrawerLink>
                    ))}
                  </ul>
                </>
              ) : null}

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Account
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {user ? (
                  <>
                    <DrawerLink href="/account" onNavigate={() => setOpen(false)}>
                      Account
                    </DrawerLink>
                    <DrawerLink href="/orders" onNavigate={() => setOpen(false)}>
                      Orders
                    </DrawerLink>
                  </>
                ) : (
                  <>
                    <DrawerLink href="/auth/login" onNavigate={() => setOpen(false)}>
                      Log in
                    </DrawerLink>
                    <DrawerLink href="/auth/signup" onNavigate={() => setOpen(false)}>
                      Sign up
                    </DrawerLink>
                  </>
                )}
              </ul>

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                More
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                <DrawerLink href="/about" onNavigate={() => setOpen(false)}>
                  About
                </DrawerLink>
                <DrawerLink href="/contact" onNavigate={() => setOpen(false)}>
                  Contact
                </DrawerLink>
                <DrawerLink href="/faq" onNavigate={() => setOpen(false)}>
                  FAQ
                </DrawerLink>
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function DrawerLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="block rounded-md px-3 py-2 text-neutral-800 hover:bg-neutral-50"
      >
        {children}
      </Link>
    </li>
  );
}
