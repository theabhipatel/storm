import { catalogMediaApi } from "../../store/apiSlice";

export interface AdminNotification {
  id: string;
  eventId: string;
  userId: string;
  channel: "email" | "sms";
  templateId: string;
  templateVersion: number;
  status: "queued" | "sent" | "failed";
  attempts: number;
  payload: Record<string, unknown>;
  providerResponse: unknown;
  sentAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
}

export interface AdminNotificationListResponse {
  items: AdminNotification[];
  nextCursor: string | null;
}

export interface AdminNotificationFilters {
  channel?: "email" | "sms";
  status?: "queued" | "sent" | "failed";
  templateId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    listAdminNotifications: build.query<
      AdminNotificationListResponse,
      AdminNotificationFilters
    >({
      query: (filters) => {
        const params: Record<string, string | number> = { limit: filters.limit ?? 25 };
        if (filters.channel) params["channel"] = filters.channel;
        if (filters.status) params["status"] = filters.status;
        if (filters.templateId) params["templateId"] = filters.templateId;
        if (filters.from) params["from"] = filters.from;
        if (filters.to) params["to"] = filters.to;
        if (filters.cursor) params["cursor"] = filters.cursor;
        return { client: "adminBff", url: "/api/admin/notifications", params };
      },
    }),
    getAdminNotification: build.query<AdminNotification, string>({
      query: (eventId) => ({
        client: "adminBff",
        url: `/api/admin/notifications/${encodeURIComponent(eventId)}`,
      }),
    }),
    retryAdminNotification: build.mutation<{ status: string }, string>({
      query: (eventId) => ({
        client: "adminBff",
        method: "POST",
        url: `/api/admin/notifications/${encodeURIComponent(eventId)}/retry`,
      }),
    }),
  }),
});

export const {
  useListAdminNotificationsQuery,
  useGetAdminNotificationQuery,
  useRetryAdminNotificationMutation,
} = api;
