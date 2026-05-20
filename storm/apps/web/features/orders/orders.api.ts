import type {
  CheckoutInitResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderHistoryEntry,
  OrderListResponse,
} from "@storm/contracts";

import { apiSlice } from "../../store/apiSlice";

export interface OrderWithHistory extends Order {
  history?: OrderHistoryEntry[];
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    initCheckout: build.mutation<CheckoutInitResponse, void>({
      query: () => ({ url: "/api/checkout/init", method: "POST" }),
    }),

    createOrder: build.mutation<
      CreateOrderResponse,
      { body: CreateOrderRequest; idempotencyKey: string }
    >({
      query: ({ body, idempotencyKey }) => ({
        url: "/api/orders",
        method: "POST",
        data: body,
        headers: { "Idempotency-Key": idempotencyKey },
      }),
      invalidatesTags: ["Cart", "OrderList"],
    }),

    listOrders: build.query<OrderListResponse, { cursor?: string; limit?: number } | void>({
      query: (args) => ({
        url: "/api/orders",
        method: "GET",
        params: args ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "OrderList" as const, id: "LIST" },
              ...result.items.map((o) => ({ type: "Order" as const, id: o.id })),
            ]
          : [{ type: "OrderList", id: "LIST" }],
    }),

    getOrder: build.query<OrderWithHistory, string>({
      query: (id) => ({ url: `/api/orders/${encodeURIComponent(id)}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    cancelOrder: build.mutation<Order, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/api/orders/${encodeURIComponent(id)}/cancel`,
        method: "POST",
        data: reason ? { reason } : {},
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Order", id: arg.id },
        { type: "OrderList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useInitCheckoutMutation,
  useCreateOrderMutation,
  useListOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
} = ordersApi;
