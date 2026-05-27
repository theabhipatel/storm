import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";

import { useLazyMe, useRefresh } from "../features/auth/auth.hooks";
import { setBootstrapped, setCurrentUser } from "../features/auth/auth.slice";
import type { RootState } from "../store";

export function AuthBootstrap() {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
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
        // Only clear if nothing else (e.g. a concurrent login) has set a user
        // while our refresh was in flight.
        if (!cancelled && store.getState().auth.currentUser === null) {
          dispatch(setCurrentUser(null));
        }
      } finally {
        if (!cancelled) dispatch(setBootstrapped(true));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
