// Dev-only: admin app talks to catalog/media services directly because Kong
// routing for those services isn't wired yet. We forward the current admin's
// identity as x-user-id / x-user-role headers — the same headers Kong injects
// in production after JWT verification.
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import { store } from "../store";
import { toApiError, type ApiError } from "./apiError";

export const CATALOG_BASE_URL =
  (import.meta.env["VITE_CATALOG_BASE_URL"] as string | undefined) ??
  "http://localhost:3002";
export const MEDIA_BASE_URL =
  (import.meta.env["VITE_MEDIA_BASE_URL"] as string | undefined) ??
  "http://localhost:3011";
export const INVENTORY_BASE_URL =
  (import.meta.env["VITE_INVENTORY_BASE_URL"] as string | undefined) ??
  "http://localhost:3004";
export const ADMIN_BFF_BASE_URL =
  (import.meta.env["VITE_ADMIN_BFF_BASE_URL"] as string | undefined) ??
  "http://localhost:3100";

function makeClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
  });
  client.interceptors.request.use((config) => {
    const user = store.getState().auth.currentUser;
    if (user) {
      config.headers["X-User-Id"] = user.id;
      config.headers["X-User-Role"] = user.role;
    }
    return config;
  });
  return client;
}

export const catalogClient = makeClient(CATALOG_BASE_URL);
export const mediaClient = makeClient(MEDIA_BASE_URL);
export const inventoryClient = makeClient(INVENTORY_BASE_URL);
export const adminBffClient = makeClient(ADMIN_BFF_BASE_URL);

export interface ServiceQueryArgs {
  client: "catalog" | "media" | "inventory" | "adminBff";
  url: string;
  method?: AxiosRequestConfig["method"] | undefined;
  data?: unknown;
  params?: AxiosRequestConfig["params"] | undefined;
  headers?: AxiosRequestConfig["headers"] | undefined;
}

export const serviceBaseQuery: BaseQueryFn<ServiceQueryArgs, unknown, ApiError> =
  async ({ client, url, method = "GET", data, params, headers }) => {
    const ax =
      client === "catalog"
        ? catalogClient
        : client === "media"
          ? mediaClient
          : client === "inventory"
            ? inventoryClient
            : adminBffClient;
    try {
      const config: AxiosRequestConfig = { url, method, data };
      if (params !== undefined) config.params = params;
      const mergedHeaders: Record<string, string> = { ...(headers ?? {}) } as Record<
        string,
        string
      >;
      // Browsers can't dedup idempotency safely without server-side help, so we
      // mint a fresh key per mutation here. Real prod calls go through admin-bff
      // which propagates the key from the form-submit token.
      const needsIdem =
        method.toString().toUpperCase() === "POST" ||
        method.toString().toUpperCase() === "PATCH" ||
        method.toString().toUpperCase() === "DELETE";
      if (needsIdem && !mergedHeaders["Idempotency-Key"]) {
        mergedHeaders["Idempotency-Key"] = `ui-${crypto.randomUUID()}`;
      }
      config.headers = mergedHeaders;
      const res = await ax.request(config);
      return { data: res.data as unknown };
    } catch (err) {
      return { error: toApiError(err) };
    }
  };
