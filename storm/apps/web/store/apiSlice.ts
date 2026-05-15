import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * RTK Query base slice. Endpoints are injected per-feature with
 * apiSlice.injectEndpoints() — keeps feature concerns separated.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "/api",
  }),
  endpoints: () => ({}),
});
