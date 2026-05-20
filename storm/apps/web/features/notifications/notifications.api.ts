import { apiSlice } from "../../store/apiSlice";

export interface NotificationEntry {
  eventId: string;
  channel: "email" | "sms";
  templateId: string;
  status: "queued" | "sent" | "failed";
  payload: Record<string, unknown>;
  sentAt: string | null;
  failedAt: string | null;
}

export interface NotificationListResponse {
  items: NotificationEntry[];
  nextCursor: string | null;
}

const api = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    listNotifications: build.query<
      NotificationListResponse,
      { cursor?: string; limit?: number } | void
    >({
      query: (args) => ({
        url: "/api/me/notifications",
        method: "GET",
        params: args ?? {},
      }),
      providesTags: ["Notifications"],
    }),
  }),
});

export const { useListNotificationsQuery } = api;
