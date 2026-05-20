import { z } from "zod";

export const InventoryEventTypes = {
  Reserved: "Inventory.Reserved.v1",
  Released: "Inventory.Released.v1",
  StockChanged: "Inventory.StockChanged.v1",
  LowStock: "Inventory.LowStock.v1",
} as const;

export type InventoryEventType =
  (typeof InventoryEventTypes)[keyof typeof InventoryEventTypes];

export const InventoryReservedPayload = z.object({
  reservationId: z.string().uuid(),
  orderId: z.string().uuid(),
  expiresAt: z.string().datetime(),
  items: z.array(
    z.object({
      sku: z.string(),
      qty: z.number().int().positive(),
    }),
  ),
});

export const InventoryReleasedPayload = z.object({
  reservationId: z.string().uuid(),
  reason: z.enum(["expired", "order_failed", "order_cancelled", "manual"]),
});

export const InventoryStockChangedPayload = z.object({
  sku: z.string(),
  productId: z.string().uuid(),
  quantityOnHand: z.number().int().nonnegative(),
  quantityReserved: z.number().int().nonnegative(),
  reason: z.string(),
});

export const InventoryLowStockPayload = z.object({
  sku: z.string(),
  productId: z.string().uuid(),
  quantityOnHand: z.number().int().nonnegative(),
  threshold: z.number().int().nonnegative(),
});

export type InventoryReserved = z.infer<typeof InventoryReservedPayload>;
export type InventoryReleased = z.infer<typeof InventoryReleasedPayload>;
export type InventoryStockChanged = z.infer<typeof InventoryStockChangedPayload>;
export type InventoryLowStock = z.infer<typeof InventoryLowStockPayload>;
