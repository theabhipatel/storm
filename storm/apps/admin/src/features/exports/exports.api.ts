import { catalogMediaApi } from "../../store/apiSlice";

export interface ExportRecord {
  id: string;
  kind: "orders" | "users";
  status: "queued" | "running" | "ready" | "failed";
  createdAt: string;
  completedAt: string | null;
  filename: string;
  rowCount: number | null;
  errorMessage: string | null;
  downloadUrl: string | null;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    startOrdersExport: build.mutation<{ exportId: string }, Record<string, string>>({
      query: (filters) => ({
        client: "adminBff",
        method: "POST",
        url: "/api/admin/orders/export",
        data: filters,
      }),
    }),
    startUsersExport: build.mutation<{ exportId: string }, Record<string, string>>({
      query: (filters) => ({
        client: "adminBff",
        method: "POST",
        url: "/api/admin/users/export",
        data: filters,
      }),
    }),
    getExportStatus: build.query<ExportRecord, string>({
      query: (id) => ({
        client: "adminBff",
        url: `/api/admin/exports/${encodeURIComponent(id)}`,
      }),
    }),
  }),
});

export const {
  useStartOrdersExportMutation,
  useStartUsersExportMutation,
  useGetExportStatusQuery,
  useLazyGetExportStatusQuery,
} = api;
