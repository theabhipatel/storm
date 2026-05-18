import type { AxiosError } from "axios";

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string | undefined;
}

interface ServerErrorBody {
  error?: { code?: string; message?: string; details?: unknown; requestId?: string };
}

export function toApiError(err: unknown): ApiError {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const body = err.response?.data as ServerErrorBody | undefined;
    const inner = body?.error;
    if (inner?.code) {
      return {
        status,
        code: inner.code,
        message: inner.message ?? "Request failed.",
        details: inner.details,
        requestId: inner.requestId,
      };
    }
    return {
      status,
      code: status === 0 ? "NETWORK_ERROR" : "UNKNOWN_ERROR",
      message: err.message,
    };
  }
  return {
    status: 0,
    code: "UNKNOWN_ERROR",
    message: err instanceof Error ? err.message : "Unknown error.",
  };
}

function isAxiosError(err: unknown): err is AxiosError {
  return Boolean(err && typeof err === "object" && (err as AxiosError).isAxiosError);
}
