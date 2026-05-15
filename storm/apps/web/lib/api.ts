import axios, { type AxiosInstance } from "axios";

/**
 * Singleton axios instance. Never create a second.
 * Per CLAUDE.md: requestId is added by the gateway; this instance
 * forwards Authorization (when present) and propagates request IDs
 * from the server in responses for client logging.
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Standardized error shape: { error: { code, message, details?, requestId } }
    return Promise.reject(err);
  },
);
