"use client";

import {
  Heart,
  Search,
  ShoppingCart,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  useAuthBootstrapped,
  useCurrentUser,
} from "../../features/auth/auth.hooks";
import { useCart } from "../../features/cart/useCart";
import { useLazyAutocompleteQuery } from "../../features/search/search.api";
import { formatINR } from "../../lib/format";
import { MobileDrawer } from "./MobileDrawer";

interface DrawerCategory {
  id: string;
  name: string;
  slug: string;
}

const DEBOUNCE_MS = 150;

export function SiteHeader({
  drawerCategories = [],
}: {
  drawerCategories?: DrawerCategory[];
}) {
  const router = useRouter();
  const user = useCurrentUser();
  const bootstrapped = useAuthBootstrapped();
  const [trigger, { data, isFetching }] = useLazyAutocompleteQuery();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length === 0) {
      setOpen(false);
      return;
    }
    const handle = setTimeout(() => {
      void trigger(trimmed);
      setOpen(true);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [q, trigger]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items = data?.items ?? [];

  function submit(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (!open || items.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit(q);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(items.length, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(-1, i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        const it = items[activeIndex]!;
        setOpen(false);
        router.push(`/p/${it.slug}`);
      } else {
        submit(q);
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-nav">
      <div className="mx-auto flex h-16 max-w-page items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <MobileDrawer categories={drawerCategories} />
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary-foreground"
        >
          Storm
        </Link>

        <div ref={containerRef} className="relative hidden flex-1 max-w-2xl md:block">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActiveIndex(-1);
              }}
              onFocus={() => {
                if (items.length > 0 || q.trim().length > 0) setOpen(true);
              }}
              onKeyDown={onKey}
              placeholder="Search products, brands and categories"
              className="h-10 w-full rounded-md border border-transparent bg-surface pl-9 pr-9 text-sm text-text shadow-sm placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              role="combobox"
              aria-label="Search"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls="storm-autocomplete-listbox"
            />
            {q.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setOpen(false);
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-text-subtle hover:bg-surface-muted hover:text-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {open && (
            <div
              id="storm-autocomplete-listbox"
              role="listbox"
              className="absolute left-0 right-0 z-40 mt-1 max-h-96 overflow-y-auto rounded-md border border-border bg-surface text-text shadow-elevated"
            >
              {isFetching && items.length === 0 && (
                <div className="px-3 py-2 text-sm text-text-muted">Searching…</div>
              )}
              {!isFetching && items.length === 0 && q.trim().length > 0 && (
                <div className="px-3 py-2 text-sm text-text-muted">No suggestions</div>
              )}
              {items.map((it, idx) => (
                <button
                  key={`${it.kind}-${it.id}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/p/${it.slug}`);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-muted ${
                    idx === activeIndex ? "bg-surface-muted" : ""
                  }`}
                >
                  {it.primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.primaryImageUrl}
                      alt=""
                      className="h-9 w-9 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 flex-shrink-0 rounded bg-surface-strong" />
                  )}
                  <span className="flex-1 truncate text-text">{it.label}</span>
                  {typeof it.basePrice === "number" && (
                    <span className="text-xs font-semibold text-text-muted">
                      {formatINR(it.basePrice, it.currency ?? "INR")}
                    </span>
                  )}
                </button>
              ))}
              {q.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => submit(q)}
                  className="block w-full border-t border-border px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-surface-muted"
                >
                  Search for &ldquo;{q.trim()}&rdquo;
                </button>
              )}
            </div>
          )}
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <MobileSearchButton onClick={() => router.push("/search")} />
          {!bootstrapped ? (
            <span className="px-3 text-sm text-primary-foreground/80">…</span>
          ) : user ? (
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-white/10 sm:inline-flex"
            >
              <User className="h-5 w-5" />
              <span>{user.name.split(" ")[0]}</span>
              <ChevronDown className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-primary hover:bg-white/95 sm:inline-flex bg-white"
            >
              Login
            </Link>
          )}
          <Link
            href="/wishlist"
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-white/10 sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            <span>Wishlist</span>
          </Link>
          <CartIcon />
        </nav>
      </div>
    </header>
  );
}

function MobileSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search"
      className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground hover:bg-white/10"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}

function CartIcon() {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className="relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-white/10"
    >
      <span className="relative inline-flex">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 ? (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold leading-none text-accent-foreground">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline">Cart</span>
    </Link>
  );
}
