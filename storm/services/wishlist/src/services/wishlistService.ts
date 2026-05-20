import {
  StormError,
  ErrorCodes,
  WISHLIST_MAX_ITEMS,
  type Wishlist,
  type WishlistItem,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";

import type { PrismaClient } from "../db.js";
import type { CatalogClient } from "./catalogClient.js";
import type { InventoryClient } from "./inventoryClient.js";
import type { CartClient } from "./cartClient.js";

export interface WishlistService {
  get(userId: string): Promise<Wishlist>;
  add(userId: string, sku: string): Promise<Wishlist>;
  remove(userId: string, sku: string): Promise<Wishlist>;
  moveToCart(userId: string, sku: string): Promise<Wishlist>;
}

export function wishlistService(deps: {
  prisma: PrismaClient;
  catalog: CatalogClient;
  inventory: InventoryClient;
  cart: CartClient;
  logger: Logger;
}): WishlistService {
  const { prisma, catalog, inventory, cart, logger } = deps;

  async function ensureWishlist(userId: string) {
    return prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async function shape(userId: string): Promise<Wishlist> {
    const rows = await prisma.wishlistItem.findMany({
      where: { wishlistId: userId },
      orderBy: { addedAt: "desc" },
    });
    if (rows.length === 0) {
      return { userId, items: [], itemCount: 0 };
    }
    const skus = rows.map((r) => r.sku);
    const [products, stock] = await Promise.all([
      catalog.lookupBySkus(skus),
      inventory.getStock(skus),
    ]);
    const bySku = new Map(products.map((p) => [p.sku, p]));
    const items: WishlistItem[] = rows.map((r) => {
      const p = bySku.get(r.sku);
      const stockEntry = stock.get(r.sku);
      return {
        sku: r.sku,
        productId: r.productId,
        name: p?.name ?? r.sku,
        slug: p?.slug ?? "",
        primaryImageUrl: null,
        currentPrice: p?.basePrice ?? 0,
        currency: "INR",
        available: (stockEntry?.quantityAvailable ?? 0) > 0,
        addedAt: r.addedAt.toISOString(),
      };
    });
    return { userId, items, itemCount: items.length };
  }

  async function get(userId: string): Promise<Wishlist> {
    await ensureWishlist(userId);
    return shape(userId);
  }

  async function add(userId: string, sku: string): Promise<Wishlist> {
    await ensureWishlist(userId);

    const products = await catalog.lookupBySkus([sku]);
    const product = products[0];
    if (!product || product.status !== "published") {
      throw new StormError({
        code: ErrorCodes.PRODUCT_NOT_PUBLISHED,
        message: "Product is not available.",
        status: 422,
      });
    }
    const count = await prisma.wishlistItem.count({ where: { wishlistId: userId } });
    if (count >= WISHLIST_MAX_ITEMS) {
      const exists = await prisma.wishlistItem.findUnique({
        where: { wishlistId_sku: { wishlistId: userId, sku } },
      });
      if (!exists) {
        throw new StormError({
          code: ErrorCodes.WISHLIST_LIMIT_EXCEEDED,
          message: `Wishlist limit of ${WISHLIST_MAX_ITEMS} reached.`,
          status: 422,
        });
      }
    }
    await prisma.wishlistItem.upsert({
      where: { wishlistId_sku: { wishlistId: userId, sku } },
      create: { wishlistId: userId, sku, productId: product.id },
      update: {},
    });
    return shape(userId);
  }

  async function remove(userId: string, sku: string): Promise<Wishlist> {
    await prisma.wishlistItem
      .delete({ where: { wishlistId_sku: { wishlistId: userId, sku } } })
      .catch(() => undefined);
    return shape(userId);
  }

  async function moveToCart(userId: string, sku: string): Promise<Wishlist> {
    const item = await prisma.wishlistItem.findUnique({
      where: { wishlistId_sku: { wishlistId: userId, sku } },
    });
    if (!item) {
      throw new StormError({
        code: ErrorCodes.NOT_FOUND,
        message: "Wishlist item not found.",
        status: 404,
      });
    }
    try {
      await cart.addItem({ userId, productId: item.productId, qty: 1 });
    } catch (err) {
      logger.warn({ err, sku }, "wishlist_move_to_cart_failed");
      throw err;
    }
    await prisma.wishlistItem.delete({
      where: { wishlistId_sku: { wishlistId: userId, sku } },
    });
    return shape(userId);
  }

  return { get, add, remove, moveToCart };
}
