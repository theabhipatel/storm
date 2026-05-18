import { apiSlice } from "../../store/apiSlice";
import { tokenStore } from "../../lib/tokenStore";
import { setCurrentUser } from "./auth.slice";
import type { LoginResponse, MeResponse, RefreshResponse } from "./auth.types";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    signup: build.mutation<{ status: string }, { email: string; password: string; name: string }>({
      query: (body) => ({ url: "/api/auth/signup", method: "POST", data: body }),
    }),

    verifyEmail: build.mutation<void, { token: string }>({
      query: (body) => ({ url: "/api/auth/verify-email", method: "POST", data: body }),
    }),

    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", data: body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          tokenStore.set(data.accessToken);
          dispatch(setCurrentUser(data.user));
        } catch {
          /* surfaced via mutation.error */
        }
      },
      invalidatesTags: ["CurrentUser"],
    }),

    refresh: build.mutation<RefreshResponse, void>({
      query: () => ({ url: "/api/auth/refresh", method: "POST" }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          tokenStore.set(data.accessToken);
        } catch {
          tokenStore.set(null);
        }
      },
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: "/api/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          tokenStore.set(null);
          dispatch(setCurrentUser(null));
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),

    logoutAll: build.mutation<void, void>({
      query: () => ({ url: "/api/auth/logout-all", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          tokenStore.set(null);
          dispatch(setCurrentUser(null));
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),

    me: build.query<MeResponse, void>({
      query: () => ({ url: "/api/auth/me", method: "GET" }),
      providesTags: ["CurrentUser"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data.user));
        } catch {
          dispatch(setCurrentUser(null));
        }
      },
    }),

    requestPasswordReset: build.mutation<void, { email: string }>({
      query: (body) => ({ url: "/api/auth/password-reset", method: "POST", data: body }),
    }),

    confirmPasswordReset: build.mutation<void, { token: string; password: string }>({
      query: (body) => ({ url: "/api/auth/password-reset/confirm", method: "POST", data: body }),
    }),

    changePassword: build.mutation<
      LoginResponse,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/api/auth/password-change", method: "POST", data: body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          tokenStore.set(data.accessToken);
          dispatch(setCurrentUser(data.user));
        } catch {
          /* surfaced via mutation.error */
        }
      },
    }),
  }),
});

export const {
  useSignupMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useMeQuery,
  useLazyMeQuery,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useChangePasswordMutation,
} = authApi;
