import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useLazyMe, useRefresh } from "../features/auth/auth.hooks";
import { setBootstrapped, setCurrentUser } from "../features/auth/auth.slice";

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
  }, []);

  return null;
}
