import { z } from "zod";
import { SkuSchema } from "./catalog.js";

export const StockItemSchema = z.object({
  sku: SkuSchema,
  productId: z.string().uuid(),
  productName: z.string().optional(),
  quantityOnHand: z.number().int().nonnegative(),
  quantityReserved: z.number().int().nonnegative(),
  quantityAvailable: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  belowThreshold: z.boolean(),
  updatedAt: z.string().datetime(),
});
export type StockItem = z.infer<typeof StockItemSchema>;

export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  sku: SkuSchema,
  delta: z.number().int(),
  reason: z.string(),
  reservationId: z.string().uuid().nullable(),
  occurredAt: z.string().datetime(),
});
export type StockMovement = z.infer<typeof StockMovementSchema>;

export const ReservationSchema = z.object({
  id: z.string().uuid(),
  sku: SkuSchema,
  qty: z.number().int().positive(),
  orderId: z.string().uuid(),
  status: z.enum(["active", "confirmed", "released"]),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type Reservation = z.infer<typeof ReservationSchema>;

export const StockDetailSchema = StockItemSchema.extend({
  movements: z.array(StockMovementSchema),
  reservations: z.array(ReservationSchema),
});
export type StockDetail = z.infer<typeof StockDetailSchema>;

export const StockAdjustmentSchema = z.object({
  delta: z.number().int().refine((n) => n !== 0, "delta must be non-zero"),
  reason: z.string().min(1).max(200),
  lowStockThreshold: z.number().int().nonnegative().optional(),
});
export type StockAdjustmentInput = z.infer<typeof StockAdjustmentSchema>;

export const StockListQuerySchema = z.object({
  q: z.string().max(120).optional(),
  productId: z.string().uuid().optional(),
  sku: SkuSchema.optional(),
  lowStockOnly: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type StockListQuery = z.infer<typeof StockListQuerySchema>;
