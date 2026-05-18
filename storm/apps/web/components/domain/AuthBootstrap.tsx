"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useLazyMe, useRefresh } from "../../features/auth/auth.hooks";
import { setBootstrapped, setCurrentUser } from "../../features/auth/auth.slice";

// Mounted once at app root. Tries a silent /refresh: if the user has a valid
// refresh cookie, mints an access token and fetches /me. Otherwise marks the
// auth state as bootstrapped with no user. Pages can use useCurrentUser() and
// useAuthBootstrapped() to gate rendering.
export function AuthBootstrap() {
  const dispatch = useDispatch();
  const [refresh] = useRefresh();
  const [fetchMe] = useLazyMe();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await refresh().unwrap();
        if (cancelled || !res.accessToken) return;
        await fetchMe().unwrap();
      } catch {
        dispatch(setCurrentUser(null));
      } finally {
        if (!cancelled) dispatch(setBootstrapped(true));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
