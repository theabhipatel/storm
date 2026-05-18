import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { tokenStore } from "./tokenStore";

// Single axios instance for the whole app. Never instantiate elsewhere.
export const api: AxiosInstance = axios.create({
  baseURL: process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "http://localhost:8000",
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Request interceptors -------------------------------------------------
// 1. Bearer access token (when in memory)
// 2. X-CSRF-Token for cookie-bearing routes (refresh / logout / logout-all / password-change)
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  if (typeof document !== "undefined" && needsCsrf(config.url)) {
    const csrf = readCookie("csrf_token");
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
  }
  return config;
});

function needsCsrf(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/logout") ||
    url.includes("/api/auth/password-change")
  );
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]!) : null;
}

// --- Silent refresh (single-flight) --------------------------------------
let inflightRefresh: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!inflightRefresh) {
    inflightRefresh = (async () => {
      try {
        const baseURL =
          (api.defaults.baseURL as string | undefined) ??
          process.env["NEXT_PUBLIC_API_BASE_URL"] ??
          "http://localhost:8000";
        const res = await axios.post<{ accessToken: string }>(
          "/api/auth/refresh",
          undefined,
          {
            baseURL,
            withCredentials: true,
            headers: { "X-CSRF-Token": readCookie("csrf_token") ?? "" },
          },
        );
        const data = res.data as { accessToken: string };
        tokenStore.set(data.accessToken);
        return data.accessToken;
      } catch {
        tokenStore.set(null);
        return null;
      } finally {
        inflightRefresh = null;
      }
    })();
  }
  return inflightRefresh;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const config = err.config as RetryableConfig | undefined;
    const status = err.response?.status;
    const url = config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/signup") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/verify-email") ||
      url.includes("/api/auth/password-reset");

    if (status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true;
      const fresh = await refreshAccessToken();
      if (fresh) {
        config.headers["Authorization"] = `Bearer ${fresh}`;
        return api.request(config);
      }
    }
    return Promise.reject(err);
  },
);

export { refreshAccessToken };
