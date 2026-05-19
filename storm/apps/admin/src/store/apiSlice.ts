import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../lib/baseQuery";
import { serviceBaseQuery } from "../lib/serviceApi";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: ["CurrentUser", "AdminUserList", "AdminUserDetail"],
  endpoints: () => ({}),
});

// Separate slice for catalog/media since they live behind a different base URL
// in dev (direct service calls). Kept distinct so identity-bound auth flows
// don't pull in the dev-only x-user-* header injection.
export const catalogMediaApi = createApi({
  reducerPath: "catalogMediaApi",
  baseQuery: serviceBaseQuery,
  tagTypes: [
    "Products",
    "Product",
    "Categories",
    "Brands",
    "Media",
  ],
  endpoints: () => ({}),
});
