import { catalogMediaApi } from "../../store/apiSlice";

export interface StockItemDto {
  sku: string;
  productId: string;
  productName?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lowStockThreshold: number;
  belowThreshold: boolean;
  updatedAt: string;
}

export interface StockMovementDto {
  id: string;
  sku: string;
  delta: number;
  reason: string;
  reservationId: string | null;
  occurredAt: string;
}

export interface ReservationDto {
  id: string;
  sku: string;
  qty: number;
  orderId: string;
  status: "active" | "confirmed" | "released";
  createdAt: string;
  expiresAt: string;
}

export interface StockDetailDto extends StockItemDto {
  movements: StockMovementDto[];
  reservations: ReservationDto[];
}

export interface StockListResponse {
  data: StockItemDto[];
  page: { nextCursor: string | null; hasMore: boolean; limit: number };
}

export interface StockListFilters {
  q?: string | undefined;
  productId?: string | undefined;
  sku?: string | undefined;
  lowStockOnly?: boolean | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
}

export interface AdjustStockInput {
  sku: string;
  delta: number;
  reason: string;
  lowStockThreshold?: number;
}

const api = catalogMediaApi.injectEndpoints({
  endpoints: (build) => ({
    listStock: build.query<StockListResponse, StockListFilters>({
      query: (filters) => {
        const params: Record<string, string | number> = { limit: filters.limit ?? 20 };
        if (filters.q) params["q"] = filters.q;
        if (filters.productId) params["productId"] = filters.productId;
        if (filters.sku) params["sku"] = filters.sku;
        if (filters.lowStockOnly !== undefined) params["lowStockOnly"] = String(filters.lowStockOnly);
        if (filters.cursor) params["cursor"] = filters.cursor;
        return {
          client: "inventory",
          url: "/api/admin/stock",
          params,
        };
      },
      providesTags: ["Stock"],
    }),
    getStockDetail: build.query<StockDetailDto, string>({
      query: (sku) => ({
        client: "inventory",
        url: `/api/admin/stock/${encodeURIComponent(sku)}`,
      }),
      providesTags: (_r, _e, sku) => [{ type: "StockDetail", id: sku }],
    }),
    adjustStock: build.mutation<StockItemDto, AdjustStockInput>({
      query: ({ sku, ...body }) => ({
        client: "inventory",
        url: `/api/admin/stock/${encodeURIComponent(sku)}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        "Stock",
        "LowStock",
        { type: "StockDetail", id: arg.sku },
      ],
    }),
    lowStockAlerts: build.query<{ data: StockItemDto[] }, void>({
      query: () => ({
        client: "inventory",
        url: "/api/admin/low-stock-alerts",
      }),
      providesTags: ["LowStock"],
    }),
  }),
});

export const {
  useListStockQuery,
  useGetStockDetailQuery,
  useAdjustStockMutation,
  useLowStockAlertsQuery,
} = api;
