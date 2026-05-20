"use client";

import { useEffect, useRef } from "react";

import { useCurrentUser } from "../auth/auth.hooks";
import { useMergeCartMutation } from "./cart.api";
import { anonCart } from "./anonCart";

// Fires once per session when the user transitions from anonymous to
// logged-in. Sends localStorage cart contents to the server merge endpoint,
// then clears the local cart. Server resolves price refresh + stock filtering.
export function CartMergeOnLogin() {
  const user = useCurrentUser();
  const [mergeCart] = useMergeCartMutation();
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      mergedFor.current = null;
      return;
    }
    if (mergedFor.current === user.id) return;
    const state = anonCart.get();
    if (state.items.length === 0) {
      mergedFor.current = user.id;
      return;
    }
    void (async () => {
      try {
        await mergeCart({
          items: state.items.map((i) => ({
            productId: i.productId,
            ...(i.variantId !== undefined ? { variantId: i.variantId } : {}),
            ...(i.sku !== undefined ? { sku: i.sku } : {}),
            qty: i.qty,
          })),
        }).unwrap();
        anonCart.clear();
      } catch {
        // Keep local cart so user can retry on next reload.
      } finally {
        mergedFor.current = user.id;
      }
    })();
  }, [user, mergeCart]);

  return null;
}
