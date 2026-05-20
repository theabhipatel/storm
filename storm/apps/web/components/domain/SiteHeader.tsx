"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  useCurrentUser,
  useAuthBootstrapped,
} from "../../features/auth/auth.hooks";
import { useLazyAutocompleteQuery } from "../../features/search/search.api";
import { useCart } from "../../features/cart/useCart";
import { formatINR } from "../../lib/format";

const DEBOUNCE_MS = 150;

export function SiteHeader() {
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
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-900"
        >
          Storm
        </Link>
        <div ref={containerRef} className="relative flex-1">
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
            placeholder="Search products, brands, categories…"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            role="combobox"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="storm-autocomplete-listbox"
          />
          {open && (
            <div
              id="storm-autocomplete-listbox"
              role="listbox"
              className="absolute left-0 right-0 z-40 mt-1 max-h-96 overflow-y-auto rounded-md border border-neutral-200 bg-white shadow-lg"
            >
              {isFetching && items.length === 0 && (
                <div className="px-3 py-2 text-sm text-neutral-500">Searching…</div>
              )}
              {!isFetching && items.length === 0 && q.trim().length > 0 && (
                <div className="px-3 py-2 text-sm text-neutral-500">No suggestions</div>
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
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                    idx === activeIndex ? "bg-neutral-50" : ""
                  }`}
                >
                  {it.primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.primaryImageUrl}
                      alt=""
                      className="h-8 w-8 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 flex-shrink-0 rounded bg-neutral-100" />
                  )}
                  <span className="flex-1 truncate">{it.label}</span>
                  {typeof it.basePrice === "number" && (
                    <span className="text-xs text-neutral-500">
                      {formatINR(it.basePrice, it.currency ?? "INR")}
                    </span>
                  )}
                </button>
              ))}
              {q.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => submit(q)}
                  className="block w-full border-t border-neutral-100 px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Search for &ldquo;{q.trim()}&rdquo;
                </button>
              )}
            </div>
          )}
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <CartIcon />
          <Link href="/wishlist" className="text-neutral-700 hover:text-neutral-900">
            Wishlist
          </Link>
          {!bootstrapped ? (
            <span className="text-neutral-400">…</span>
          ) : user ? (
            <Link href="/account" className="text-neutral-700 hover:text-neutral-900">
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-neutral-700 hover:text-neutral-900">
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-800"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function CartIcon() {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className="relative inline-flex items-center gap-1 rounded-md px-2 py-1 text-neutral-700 hover:text-neutral-900"
    >
      <span aria-hidden="true">Cart</span>
      {itemCount > 0 && (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-900 px-1.5 text-xs font-semibold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
