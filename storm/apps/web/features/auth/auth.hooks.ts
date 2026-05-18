import { useSelector } from "react-redux";

import type { RootState } from "../../store";
import type { PublicUser } from "./auth.types";

export {
  useSignupMutation as useSignup,
  useVerifyEmailMutation as useVerifyEmail,
  useLoginMutation as useLogin,
  useRefreshMutation as useRefresh,
  useLogoutMutation as useLogout,
  useLogoutAllMutation as useLogoutAll,
  useMeQuery as useMe,
  useLazyMeQuery as useLazyMe,
  useRequestPasswordResetMutation as useRequestPasswordReset,
  useConfirmPasswordResetMutation as useConfirmPasswordReset,
  useChangePasswordMutation as useChangePassword,
} from "./auth.api";

export function useCurrentUser(): PublicUser | null {
  return useSelector((s: RootState) => s.auth.currentUser);
}

export function useAuthBootstrapped(): boolean {
  return useSelector((s: RootState) => s.auth.bootstrapped);
}
