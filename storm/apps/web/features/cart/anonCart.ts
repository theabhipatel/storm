"use client";

// Anonymous cart kept in localStorage until the user logs in.
// On login, the contents are sent to POST /api/cart/merge and cleared.
const KEY = "storm.anonCart.v1";

export interface AnonCartItem {
  productId: string;
  variantId?: string | undefined;
  sku?: string | undefined;
  qty: number;
  name: string;
  slug: string;
  primaryImageUrl?: string | undefined;
  basePrice: number;
  currency: "INR";
}

interface AnonCartState {
  items: AnonCartItem[];
  updatedAt: string;
}

export const MAX_DISTINCT = 50;
export const MAX_QTY = 10;

function read(): AnonCartState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as AnonCartState;
    if (!Array.isArray(parsed.items)) return empty();
    return parsed;
  } catch {
    return empty();
  }
}

function write(next: AnonCartState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("storm:anonCart"));
}

function empty(): AnonCartState {
  return { items: [], updatedAt: new Date().toISOString() };
}

export const anonCart = {
  get(): AnonCartState {
    return read();
  },
  addItem(item: AnonCartItem): AnonCartState {
    const state = read();
    const idx = state.items.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );
    if (idx === -1) {
      if (state.items.length >= MAX_DISTINCT) return state;
      state.items.push({ ...item, qty: Math.min(MAX_QTY, item.qty) });
    } else {
      state.items[idx]!.qty = Math.min(MAX_QTY, state.items[idx]!.qty + item.qty);
    }
    const next = { ...state, updatedAt: new Date().toISOString() };
    write(next);
    return next;
  },
  updateQty(productId: string, variantId: string | undefined, qty: number): AnonCartState {
    const state = read();
    const idx = state.items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId,
    );
    if (idx === -1) return state;
    if (qty <= 0) {
      state.items.splice(idx, 1);
    } else {
      state.items[idx]!.qty = Math.min(MAX_QTY, qty);
    }
    const next = { ...state, updatedAt: new Date().toISOString() };
    write(next);
    return next;
  },
  remove(productId: string, variantId: string | undefined): AnonCartState {
    const state = read();
    state.items = state.items.filter(
      (i) => !(i.productId === productId && i.variantId === variantId),
    );
    const next = { ...state, updatedAt: new Date().toISOString() };
    write(next);
    return next;
  },
  clear(): AnonCartState {
    const next = empty();
    write(next);
    return next;
  },
  onChange(cb: () => void): () => void {
    if (typeof window === "undefined") return () => undefined;
    const h = () => cb();
    window.addEventListener("storm:anonCart", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("storm:anonCart", h);
      window.removeEventListener("storage", h);
    };
  },
};
