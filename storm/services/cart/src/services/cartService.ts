import {
  StormError,
  ErrorCodes,
  CART_MAX_DISTINCT_ITEMS,
  CART_MAX_QTY_PER_SKU,
  type Cart,
  type CartItem,
  type CartAddItemInput,
  type CartMergeInput,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { CartRepo, StoredCart, StoredCartItem } from "../repositories/cartRepo.js";
import type { CatalogClient } from "./catalogClient.js";
import type { InventoryClient } from "./inventoryClient.js";
import type { CartEventPublisher } from "./eventPublisher.js";

export interface CartService {
  get(userId: string): Promise<Cart>;
  addItem(userId: string, input: CartAddItemInput): Promise<Cart>;
  updateItem(userId: string, sku: string, qty: number): Promise<Cart>;
  removeItem(userId: string, sku: string): Promise<Cart>;
  clear(userId: string): Promise<Cart>;
  merge(userId: string, input: CartMergeInput): Promise<Cart>;
}

export function cartService(deps: {
  repo: CartRepo;
  catalog: CatalogClient;
  inventory: InventoryClient;
  events: CartEventPublisher;
  logger: Logger;
}): CartService {
  const { repo, catalog, inventory, events, logger } = deps;

  async function refreshAndShape(stored: StoredCart): Promise<Cart> {
    if (stored.items.length === 0) {
      return emptyCart(stored.userId, stored.updatedAt);
    }
    const skus = stored.items.map((i) => i.sku);
    const productIds = stored.items.map((i) => i.productId);
    const [products, stock] = await Promise.all([
      catalog.lookupByIds(productIds),
      inventory.getStock(skus),
    ]);
    const productById = new Map(products.map((p) => [p.id, p]));

    const items: CartItem[] = stored.items.map((it) => {
      const fresh = productById.get(it.productId);
      const currentPrice = fresh?.basePrice ?? it.priceSnapshot;
      const stockEntry = stock.get(it.sku);
      const available = (stockEntry?.quantityAvailable ?? 0) >= it.qty;
      return {
        sku: it.sku,
        productId: it.productId,
        variantId: it.variantId,
        name: fresh?.name ?? it.name,
        slug: fresh?.slug ?? it.slug,
        primaryImageUrl: null,
        qty: it.qty,
        priceSnapshot: it.priceSnapshot,
        currentPrice,
        currency: "INR",
        priceChanged: currentPrice !== it.priceSnapshot,
        available,
        addedAt: it.addedAt,
      };
    });
    const subtotal = items.reduce((acc, i) => acc + i.currentPrice * i.qty, 0);
    return {
      userId: stored.userId,
      items,
      itemCount: items.reduce((acc, i) => acc + i.qty, 0),
      subtotalPaise: subtotal,
      currency: "INR",
      updatedAt: stored.updatedAt,
    };
  }

  async function get(userId: string): Promise<Cart> {
    const stored = await repo.get(userId);
    await repo.touchTtl(userId);
    return refreshAndShape(stored);
  }

  async function addItem(userId: string, input: CartAddItemInput): Promise<Cart> {
    const products = await catalog.lookupByIds([input.productId]);
    const product = products[0];
    if (!product || product.status !== "published") {
      throw new StormError({
        code: ErrorCodes.PRODUCT_NOT_PUBLISHED,
        message: "Product is not available.",
        status: 422,
      });
    }
    // qty already validated by zod (1..10) on the route boundary
    const stored = await repo.get(userId);
    const existingIdx = stored.items.findIndex((i) => i.sku === product.sku);
    if (existingIdx === -1) {
      if (stored.items.length >= CART_MAX_DISTINCT_ITEMS) {
        throw new StormError({
          code: ErrorCodes.CART_LIMIT_EXCEEDED,
          message: `Cart cannot contain more than ${CART_MAX_DISTINCT_ITEMS} items.`,
          status: 422,
        });
      }
      stored.items.push({
        sku: product.sku,
        productId: product.id,
        variantId: input.variantId ?? null,
        name: product.name,
        slug: product.slug,
        primaryMediaId: product.primaryMediaId,
        qty: input.qty,
        priceSnapshot: product.basePrice,
        currency: "INR",
        addedAt: new Date().toISOString(),
      });
    } else {
      const next = stored.items[existingIdx]!.qty + input.qty;
      if (next > CART_MAX_QTY_PER_SKU) {
        throw new StormError({
          code: ErrorCodes.CART_LIMIT_EXCEEDED,
          message: `Max ${CART_MAX_QTY_PER_SKU} per SKU.`,
          status: 422,
        });
      }
      stored.items[existingIdx]!.qty = next;
    }
    const saved = await repo.save(stored);
    events
      .emitItemAdded({ userId, sku: product.sku, productId: product.id, qty: input.qty })
      .catch((err: unknown) => logger.warn({ err }, "cart_event_publish_failed"));
    return refreshAndShape(saved);
  }

  async function updateItem(userId: string, sku: string, qty: number): Promise<Cart> {
    if (qty < 1 || qty > CART_MAX_QTY_PER_SKU) {
      throw new StormError({
        code: ErrorCodes.CART_ITEM_QTY_INVALID,
        message: `Qty must be between 1 and ${CART_MAX_QTY_PER_SKU}.`,
        status: 422,
      });
    }
    const stored = await repo.get(userId);
    const idx = stored.items.findIndex((i) => i.sku === sku);
    if (idx === -1) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Item not in cart.",
        status: 404,
      });
    }
    stored.items[idx]!.qty = qty;
    const saved = await repo.save(stored);
    return refreshAndShape(saved);
  }

  async function removeItem(userId: string, sku: string): Promise<Cart> {
    const stored = await repo.get(userId);
    const next = stored.items.filter((i) => i.sku !== sku);
    if (next.length === stored.items.length) {
      // idempotent removal
      return refreshAndShape(stored);
    }
    stored.items = next;
    const saved = await repo.save(stored);
    return refreshAndShape(saved);
  }

  async function clear(userId: string): Promise<Cart> {
    await repo.clear(userId);
    return emptyCart(userId, new Date().toISOString());
  }

  async function merge(userId: string, input: CartMergeInput): Promise<Cart> {
    const incomingIds = input.items.map((i) => i.productId);
    const incomingProducts = await catalog.lookupByIds(incomingIds);
    const byId = new Map(incomingProducts.map((p) => [p.id, p]));

    const stored = await repo.get(userId);
    const bySku = new Map(stored.items.map((i) => [i.sku, i]));

    for (const item of input.items) {
      const product = byId.get(item.productId);
      if (!product || product.status !== "published") continue;
      const existing = bySku.get(product.sku);
      if (existing) {
        existing.qty = Math.min(CART_MAX_QTY_PER_SKU, existing.qty + item.qty);
      } else {
        if (bySku.size >= CART_MAX_DISTINCT_ITEMS) continue;
        const newItem: StoredCartItem = {
          sku: product.sku,
          productId: product.id,
          variantId: item.variantId ?? null,
          name: product.name,
          slug: product.slug,
          primaryMediaId: product.primaryMediaId,
          qty: Math.min(CART_MAX_QTY_PER_SKU, item.qty),
          priceSnapshot: product.basePrice,
          currency: "INR",
          addedAt: new Date().toISOString(),
        };
        bySku.set(product.sku, newItem);
      }
    }

    const allSkus = Array.from(bySku.keys());
    const stockMap = await inventory.getStock(allSkus);
    for (const sku of allSkus) {
      const entry = stockMap.get(sku);
      if (!entry || entry.quantityAvailable <= 0) {
        bySku.delete(sku);
      }
    }
    stored.items = Array.from(bySku.values());
    const saved = await repo.save(stored);
    return refreshAndShape(saved);
  }

  return { get, addItem, updateItem, removeItem, clear, merge };
}

function emptyCart(userId: string, updatedAt: string): Cart {
  return {
    userId,
    items: [],
    itemCount: 0,
    subtotalPaise: 0,
    currency: "INR",
    updatedAt,
  };
}
