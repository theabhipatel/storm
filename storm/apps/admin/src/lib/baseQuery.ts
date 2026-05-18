import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";

import { api } from "./api";
import { toApiError, type ApiError } from "./apiError";

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"] | undefined;
  data?: unknown;
  params?: AxiosRequestConfig["params"] | undefined;
  headers?: AxiosRequestConfig["headers"] | undefined;
}

export const axiosBaseQuery: BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> = async ({
  url,
  method = "GET",
  data,
  params,
  headers,
}) => {
  try {
    const config: AxiosRequestConfig = { url, method, data };
    if (params !== undefined) config.params = params;
    if (headers !== undefined) config.headers = headers;
    const res = await api.request(config);
    return { data: res.data as unknown };
  } catch (err) {
    return { error: toApiError(err) };
  }
};
