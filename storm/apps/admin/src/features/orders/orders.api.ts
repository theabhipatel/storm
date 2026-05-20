import type {
  AdminOrderDetail,
  OrderHistoryEntry,
  OrderListResponse,
  OrderStatus,
} from "@storm/contracts";

import { catalogMediaApi } from "../../store/apiSlice";

export interface AdminOrderListFilters {
  status?: OrderStatus | undefined;
  q?: string | undefined;
  customerId?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
}

export interface AdminOrderPayment {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  method: string | null;
  status: string;
  capturedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface AdminOrderReservation {
  id: string;
  sku: string;
  qty: number;
  orderId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export interface AdminOrderDetailResponse extends AdminOrderDetail {
  payment: AdminOrderPayment | null;
  reservations: AdminOrderReservation[];
}

export interface AdminOrderAuditResponse {
  orderId: string;
  history: OrderHistoryEntry[];
}

export interface UpdateOrderStatusInput {
  id: string;
  status: OrderStatus;
  reason?: string;
}

export interface CancelOrderInput {
  id: string;
  reason: string;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    listAdminOrders: build.query<OrderListResponse, AdminOrderListFilters>({
      query: (filters) => {
        const params: Record<string, string | number> = { limit: filters.limit ?? 20 };
        if (filters.status) params["status"] = filters.status;
        if (filters.q) params["q"] = filters.q;
        if (filters.customerId) params["customerId"] = filters.customerId;
        if (filters.from) params["from"] = filters.from;
        if (filters.to) params["to"] = filters.to;
        if (filters.cursor) params["cursor"] = filters.cursor;
        return {
          client: "adminBff",
          url: "/api/admin/orders",
          params,
        };
      },
      providesTags: ["AdminOrderList"],
    }),

    getAdminOrder: build.query<AdminOrderDetailResponse, string>({
      query: (id) => ({
        client: "adminBff",
        url: `/api/admin/orders/${encodeURIComponent(id)}`,
      }),
      providesTags: (_r, _e, id) => [{ type: "AdminOrder" as const, id }],
    }),

    getAdminOrderAudit: build.query<AdminOrderAuditResponse, string>({
      query: (id) => ({
        client: "adminBff",
        url: `/api/admin/orders/${encodeURIComponent(id)}/audit`,
      }),
      providesTags: (_r, _e, id) => [{ type: "AdminOrderAudit" as const, id }],
    }),

    updateOrderStatus: build.mutation<unknown, UpdateOrderStatusInput>({
      query: ({ id, status, reason }) => ({
        client: "adminBff",
        url: `/api/admin/orders/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        data: reason ? { status, reason } : { status },
      }),
      invalidatesTags: (_r, _e, arg) => [
        "AdminOrderList",
        { type: "AdminOrder", id: arg.id },
        { type: "AdminOrderAudit", id: arg.id },
      ],
    }),

    cancelAdminOrder: build.mutation<unknown, CancelOrderInput>({
      query: ({ id, reason }) => ({
        client: "adminBff",
        url: `/api/admin/orders/${encodeURIComponent(id)}/cancel`,
        method: "POST",
        data: { reason },
      }),
      invalidatesTags: (_r, _e, arg) => [
        "AdminOrderList",
        { type: "AdminOrder", id: arg.id },
        { type: "AdminOrderAudit", id: arg.id },
      ],
    }),
  }),
});

export const {
  useListAdminOrdersQuery,
  useGetAdminOrderQuery,
  useGetAdminOrderAuditQuery,
  useUpdateOrderStatusMutation,
  useCancelAdminOrderMutation,
} = api;
