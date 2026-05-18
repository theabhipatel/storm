import { useSelector } from "react-redux";

import type { RootState } from "../../store";
import type { PublicUser } from "./auth.types";

export {
  useLoginMutation as useLogin,
  useRefreshMutation as useRefresh,
  useLogoutMutation as useLogout,
  useMeQuery as useMe,
  useLazyMeQuery as useLazyMe,
  useRequestPasswordResetMutation as useRequestPasswordReset,
  useConfirmPasswordResetMutation as useConfirmPasswordReset,
} from "./auth.api";

export function useCurrentUser(): PublicUser | null {
  return useSelector((s: RootState) => s.auth.currentUser);
}

export function useAuthBootstrapped(): boolean {
  return useSelector((s: RootState) => s.auth.bootstrapped);
}
