import type { RecommendationList } from "@storm/contracts";

import { apiSlice } from "../../store/apiSlice";

export const recsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    productRecs: build.query<RecommendationList, string>({
      query: (productId) => ({
        url: `/api/recs/products/${encodeURIComponent(productId)}`,
        method: "GET",
      }),
    }),
    userRecs: build.query<RecommendationList, void>({
      query: () => ({ url: `/api/recs/users/me`, method: "GET" }),
    }),
    categoryTopRecs: build.query<RecommendationList, string>({
      query: (categoryId) => ({
        url: `/api/recs/categories/${encodeURIComponent(categoryId)}/top`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useProductRecsQuery,
  useUserRecsQuery,
  useCategoryTopRecsQuery,
} = recsApi;
