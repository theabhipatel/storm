"use client";

import { useEffect, useState } from "react";

import { useCurrentUser } from "../auth/auth.hooks";
import { useGetCartQuery } from "./cart.api";
import { anonCart } from "./anonCart";

// Returns the visible cart summary regardless of login state, plus item count
// for the header badge. Logged-in users get server-side cart; anonymous users
// see localStorage contents.
export interface UseCartReturn {
  itemCount: number;
  loading: boolean;
  isLoggedIn: boolean;
}

export function useCart(): UseCartReturn {
  const user = useCurrentUser();
  const isLoggedIn = Boolean(user);
  const serverCart = useGetCartQuery(undefined, { skip: !isLoggedIn });

  const [anonCount, setAnonCount] = useState<number>(() =>
    typeof window !== "undefined"
      ? anonCart.get().items.reduce((acc, i) => acc + i.qty, 0)
      : 0,
  );
  useEffect(() => {
    if (isLoggedIn) return;
    const unsub = anonCart.onChange(() => {
      setAnonCount(anonCart.get().items.reduce((acc, i) => acc + i.qty, 0));
    });
    setAnonCount(anonCart.get().items.reduce((acc, i) => acc + i.qty, 0));
    return unsub;
  }, [isLoggedIn]);

  if (isLoggedIn) {
    return {
      itemCount: serverCart.data?.itemCount ?? 0,
      loading: serverCart.isFetching,
      isLoggedIn: true,
    };
  }
  return { itemCount: anonCount, loading: false, isLoggedIn: false };
}
