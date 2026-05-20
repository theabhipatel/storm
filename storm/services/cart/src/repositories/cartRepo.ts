import type { Redis } from "ioredis";

export interface StoredCartItem {
  sku: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  primaryMediaId: string | null;
  qty: number;
  priceSnapshot: number;
  currency: "INR";
  addedAt: string;
}

export interface StoredCart {
  userId: string;
  items: StoredCartItem[];
  updatedAt: string;
}

const ITEMS_FIELD = "items";
const UPDATED_FIELD = "updatedAt";

export function cartRepo(redis: Redis, ttlSeconds: number) {
  function key(userId: string): string {
    return `cart:${userId}`;
  }

  async function get(userId: string): Promise<StoredCart> {
    const k = key(userId);
    const raw = await redis.hmget(k, ITEMS_FIELD, UPDATED_FIELD);
    const items: StoredCartItem[] = raw[0] ? (JSON.parse(raw[0]) as StoredCartItem[]) : [];
    const updatedAt = raw[1] ?? new Date().toISOString();
    return { userId, items, updatedAt };
  }

  async function save(cart: StoredCart): Promise<StoredCart> {
    const next: StoredCart = {
      userId: cart.userId,
      items: cart.items,
      updatedAt: new Date().toISOString(),
    };
    const k = key(cart.userId);
    await redis
      .multi()
      .hset(k, ITEMS_FIELD, JSON.stringify(next.items), UPDATED_FIELD, next.updatedAt)
      .expire(k, ttlSeconds)
      .exec();
    return next;
  }

  async function clear(userId: string): Promise<void> {
    await redis.del(key(userId));
  }

  async function touchTtl(userId: string): Promise<void> {
    await redis.expire(key(userId), ttlSeconds);
  }

  return { get, save, clear, touchTtl };
}

export type CartRepo = ReturnType<typeof cartRepo>;
