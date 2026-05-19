import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "../lib/baseQuery";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: ["CurrentUser", "AdminUserList", "AdminUserDetail"],
  endpoints: () => ({}),
});
