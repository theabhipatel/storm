import { catalogMediaApi } from "../../store/apiSlice";

export interface AuditFeedItem {
  source: "order";
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  reason: string | null;
  changedAt: string;
  customerEmail?: string | null;
}

export interface AuditFeedResponse {
  range: { from: string; to: string };
  items: AuditFeedItem[];
}

export interface AuditFeedArgs {
  from?: string;
  to?: string;
  actor?: string;
  action?: string;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    getAuditFeed: build.query<AuditFeedResponse, AuditFeedArgs>({
      query: (args) => {
        const params: Record<string, string> = {};
        if (args.from) params["from"] = args.from;
        if (args.to) params["to"] = args.to;
        if (args.actor) params["actor"] = args.actor;
        if (args.action) params["action"] = args.action;
        return { client: "adminBff", url: "/api/admin/audit", params };
      },
    }),
  }),
});

export const { useGetAuditFeedQuery } = api;
