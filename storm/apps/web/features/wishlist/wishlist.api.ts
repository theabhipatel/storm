import type { Wishlist, WishlistAddItemInput } from "@storm/contracts";

import { apiSlice } from "../../store/apiSlice";

function idemHeader(): Record<string, string> {
  return { "Idempotency-Key": crypto.randomUUID() };
}

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<Wishlist, void>({
      query: () => ({ url: "/api/wishlist", method: "GET" }),
      providesTags: ["Wishlist"],
    }),
    addWishlistItem: build.mutation<Wishlist, WishlistAddItemInput>({
      query: (body) => ({
        url: "/api/wishlist/items",
        method: "POST",
        data: body,
        headers: idemHeader(),
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeWishlistItem: build.mutation<Wishlist, { sku: string }>({
      query: ({ sku }) => ({
        url: `/api/wishlist/items/${encodeURIComponent(sku)}`,
        method: "DELETE",
        headers: idemHeader(),
      }),
      invalidatesTags: ["Wishlist"],
    }),
    moveToCart: build.mutation<Wishlist, { sku: string }>({
      query: ({ sku }) => ({
        url: `/api/wishlist/items/${encodeURIComponent(sku)}/move-to-cart`,
        method: "POST",
        data: {},
        headers: idemHeader(),
      }),
      invalidatesTags: ["Wishlist", "Cart"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useMoveToCartMutation,
} = wishlistApi;
