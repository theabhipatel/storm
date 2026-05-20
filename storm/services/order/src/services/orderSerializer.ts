import type { Order, OrderItem } from "../db.js";

export function serialiseOrder(order: Order & { items: OrderItem[] }) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    itemsCount: order.itemsCount,
    subtotalPaise: order.subtotalPaise,
    shippingFeePaise: order.shippingFeePaise,
    totalPaise: order.totalAmountPaise,
    currency: order.currency,
    address: order.addressSnapshot,
    paymentMethod: order.paymentMethod,
    razorpayOrderId: order.razorpayOrderId,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    items: order.items.map((it) => ({
      id: it.id,
      sku: it.sku,
      productId: it.productId,
      variantId: it.variantId,
      name: it.name,
      image: it.image,
      unitPricePaise: it.unitPricePaise,
      qty: it.qty,
      lineTotalPaise: it.lineTotalPaise,
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
  };
}

export function serialiseSummary(order: Order & { items: OrderItem[] }) {
  const first = order.items[0];
  return {
    id: order.id,
    status: order.status,
    itemsCount: order.itemsCount,
    totalPaise: order.totalAmountPaise,
    currency: order.currency,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    firstItemName: first?.name,
    thumbnailUrl: first && (first.image as { url?: string } | null)?.url
      ? (first.image as { url: string }).url
      : null,
  };
}
