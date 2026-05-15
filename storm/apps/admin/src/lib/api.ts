import axios, { type AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env["VITE_API_BASE_URL"] ?? "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
