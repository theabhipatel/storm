import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../lib/baseQuery";

// Root RTK Query slice. Endpoints are injected per-feature with
// apiSlice.injectEndpoints() so feature concerns stay separated.
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: ["CurrentUser", "MeProfile", "Address"],
  endpoints: () => ({}),
});
