import type {
  Cart,
  CartAddItemInput,
  CartUpdateItemInput,
  CartMergeInput,
} from "@storm/contracts";

import { apiSlice } from "../../store/apiSlice";

function idemHeader(): Record<string, string> {
  return { "Idempotency-Key": crypto.randomUUID() };
}

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<Cart, void>({
      query: () => ({ url: "/api/cart", method: "GET" }),
      providesTags: ["Cart"],
    }),
    addCartItem: build.mutation<Cart, CartAddItemInput>({
      query: (body) => ({
        url: "/api/cart/items",
        method: "POST",
        data: body,
        headers: idemHeader(),
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: build.mutation<Cart, { sku: string; body: CartUpdateItemInput }>({
      query: ({ sku, body }) => ({
        url: `/api/cart/items/${encodeURIComponent(sku)}`,
        method: "PATCH",
        data: body,
        headers: idemHeader(),
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: build.mutation<Cart, { sku: string }>({
      query: ({ sku }) => ({
        url: `/api/cart/items/${encodeURIComponent(sku)}`,
        method: "DELETE",
        headers: idemHeader(),
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: build.mutation<Cart, void>({
      query: () => ({
        url: "/api/cart",
        method: "DELETE",
        headers: idemHeader(),
      }),
      invalidatesTags: ["Cart"],
    }),
    mergeCart: build.mutation<Cart, CartMergeInput>({
      query: (body) => ({
        url: "/api/cart/merge",
        method: "POST",
        data: body,
        headers: idemHeader(),
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useLazyGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useMergeCartMutation,
} = cartApi;
