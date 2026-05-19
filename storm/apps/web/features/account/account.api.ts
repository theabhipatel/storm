import type { AddressCreateInput, AddressUpdateInput } from "@storm/contracts";

import { apiSlice } from "../../store/apiSlice";
import { tokenStore } from "../../lib/tokenStore";
import { setCurrentUser } from "../auth/auth.slice";
import type { AddressListResponse, AddressResponse, MeResponse } from "./account.types";

const accountApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    meProfile: build.query<MeResponse, void>({
      query: () => ({ url: "/api/me", method: "GET" }),
      providesTags: ["MeProfile"],
    }),

    updateName: build.mutation<void, { name: string }>({
      query: (body) => ({ url: "/api/me", method: "PATCH", data: body }),
      invalidatesTags: ["MeProfile", "CurrentUser"],
    }),

    requestEmailChange: build.mutation<
      { status: string },
      { newEmail: string; currentPassword: string }
    >({
      query: (body) => ({ url: "/api/me/email/change", method: "POST", data: body }),
    }),

    confirmEmailChange: build.mutation<void, { token: string }>({
      query: (body) => ({ url: "/api/me/email/change/confirm", method: "POST", data: body }),
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

    requestMobileChange: build.mutation<
      { status: string },
      { newMobile: string; currentPassword: string }
    >({
      query: (body) => ({ url: "/api/me/mobile/change", method: "POST", data: body }),
    }),

    confirmMobileChange: build.mutation<void, { otp: string }>({
      query: (body) => ({ url: "/api/me/mobile/change/confirm", method: "POST", data: body }),
      invalidatesTags: ["MeProfile", "CurrentUser"],
    }),

    deleteAccount: build.mutation<void, { currentPassword: string; confirm: true }>({
      query: (body) => ({ url: "/api/me/delete", method: "POST", data: body }),
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

    listAddresses: build.query<AddressListResponse, void>({
      query: () => ({ url: "/api/me/addresses", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              { type: "Address", id: "LIST" },
              ...result.items.map((a) => ({ type: "Address" as const, id: a.id })),
            ]
          : [{ type: "Address", id: "LIST" }],
    }),

    getAddress: build.query<AddressResponse, string>({
      query: (id) => ({ url: `/api/me/addresses/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Address", id }],
    }),

    createAddress: build.mutation<AddressResponse, AddressCreateInput>({
      query: (body) => ({ url: "/api/me/addresses", method: "POST", data: body }),
      invalidatesTags: [{ type: "Address", id: "LIST" }, "MeProfile"],
    }),

    updateAddress: build.mutation<
      AddressResponse,
      { id: string; input: AddressUpdateInput }
    >({
      query: ({ id, input }) => ({
        url: `/api/me/addresses/${id}`,
        method: "PATCH",
        data: input,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Address", id: arg.id },
        { type: "Address", id: "LIST" },
        "MeProfile",
      ],
    }),

    deleteAddress: build.mutation<void, string>({
      query: (id) => ({ url: `/api/me/addresses/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Address", id },
        { type: "Address", id: "LIST" },
        "MeProfile",
      ],
    }),

    setDefaultAddress: build.mutation<AddressResponse, string>({
      query: (id) => ({ url: `/api/me/addresses/${id}/set-default`, method: "POST" }),
      invalidatesTags: [{ type: "Address", id: "LIST" }, "MeProfile"],
    }),
  }),
});

export const {
  useMeProfileQuery,
  useUpdateNameMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useRequestMobileChangeMutation,
  useConfirmMobileChangeMutation,
  useDeleteAccountMutation,
  useListAddressesQuery,
  useGetAddressQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = accountApi;

export { accountApi };
