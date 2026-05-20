import { catalogMediaApi } from "../../store/apiSlice";

export interface DashboardResponse {
  range: { from: string; to: string };
  orders: {
    count: number;
    revenuePaise: number;
    aovPaise: number;
    cancelledCount: number;
  };
  users: { newCount: number };
  inventory: { lowStockCount: number };
  payments: { failedCount: number };
  recentOrders: Array<{
    id: string;
    status: string;
    totalPaise: number;
    currency: string;
    createdAt: string;
    customerEmail?: string | null;
  }>;
  warnings: string[];
}

export interface DashboardArgs {
  from: string;
  to: string;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<DashboardResponse, DashboardArgs>({
      query: ({ from, to }) => ({
        client: "adminBff",
        url: "/api/admin/dashboard",
        params: { from, to },
      }),
    }),
  }),
});

export const { useGetDashboardQuery } = api;
