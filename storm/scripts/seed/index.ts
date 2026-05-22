/**
 * Storm seed runner.
 *
 * Runs once on first start of the docker compose stack (idempotent — re-runs
 * exit fast if the marker user `abhi@gmail.com` already exists).
 *
 * Mix of HTTP API calls (for catalog + inventory, so Kafka events fire and
 * search/recommendation index normally) and direct DB writes (for users,
 * addresses, wishlist, cart, orders — bypasses validation rules that would
 * reject the demo password "1234").
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import argon2 from "argon2";
import Redis from "ioredis";
import pg from "pg";
import { uuidv7 } from "uuidv7";

import {
  ABHI_CART_SKUS,
  ABHI_EMAIL,
  ABHI_PASSWORD,
  ABHI_PAST_ORDERS,
  ABHI_WISHLIST_SKUS,
  BRANDS,
  CATEGORIES,
  PRODUCTS,
  USERS,
  type SeedAddress,
  type SeedUser,
} from "./data.ts";

const env = (key: string, fallback?: string): string => {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var ${key}`);
  return v;
};

// =============================================================================
// Config
// =============================================================================

const PG_HOST = env("PG_HOST", "postgres");
const PG_PORT = Number(env("PG_PORT", "5432"));

const REDIS_URL = env("REDIS_URL", "redis://redis:6379");

const CATALOG_BASE = env("CATALOG_BASE", "http://catalog:3002");
const INVENTORY_BASE = env("INVENTORY_BASE", "http://inventory:3004");
const IDENTITY_BASE = env("IDENTITY_BASE", "http://identity:3001");
const MEDIA_BASE = env("MEDIA_BASE", "http://media:3011");

const S3_ENDPOINT = env("S3_ENDPOINT", "http://minio:9000");
const S3_REGION = env("S3_REGION", "us-east-1");
const S3_BUCKET = env("S3_BUCKET", "storm-media");
const S3_ACCESS_KEY = env("S3_ACCESS_KEY", "minio");
const S3_SECRET_KEY = env("S3_SECRET_KEY", "minio12345");

// Stable UUID used as the x-user-id when calling admin endpoints. The catalog
// service trusts the header; the actual admin user is bootstrapped by the
// `init` service separately. We use a fixed UUID for log clarity.
const ADMIN_HEADER_USER_ID = "00000000-0000-7000-8000-000000000001";

// argon2 options must match services/identity/src/auth/password.ts
const ARGON2_OPTIONS = {
  type: argon2.argon2id as 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

// =============================================================================
// Postgres helpers — one pool per service DB
// =============================================================================

function makePool(dbName: string, user: string, password: string): pg.Pool {
  return new pg.Pool({
    host: PG_HOST,
    port: PG_PORT,
    database: dbName,
    user,
    password,
    max: 4,
  });
}

const identityPool = makePool("identity", "identity", "identity_pw");
const wishlistPool = makePool("wishlist", "wishlist", "wishlist_pw");
const orderPool = makePool("order", "order", "order_pw");
const mediaPool = makePool("media", "media", "media_pw");

// =============================================================================
// Logging
// =============================================================================

function log(msg: string): void {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[seed ${ts}] ${msg}`);
}

// =============================================================================
// Readiness probes — wait until each service is reachable.
// =============================================================================

async function waitFor(label: string, url: string, timeoutMs = 240_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) {
        log(`✓ ${label} ready`);
        return;
      }
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

async function waitForPg(pool: pg.Pool, label: string, timeoutMs = 240_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await pool.query("SELECT 1");
      log(`✓ pg/${label} ready`);
      return;
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Timed out waiting for pg/${label}`);
}

// =============================================================================
// Idempotency: skip if already seeded
// =============================================================================

async function alreadySeeded(): Promise<boolean> {
  const r = await identityPool.query<{ id: string }>(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [ABHI_EMAIL],
  );
  return r.rowCount! > 0;
}

// =============================================================================
// MEDIA: upload one placeholder PNG to MinIO + insert a MediaAsset row.
// Every seeded product reuses this mediaId so we don't have to upload 30 PNGs.
// =============================================================================

// 1x1 sky-blue PNG, base64 encoded.
const PLACEHOLDER_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

let placeholderMediaId: string | null = null;

async function seedPlaceholderMedia(): Promise<string> {
  const mediaId = uuidv7();
  const s3Key = `original/${mediaId}.png`;
  const body = Buffer.from(PLACEHOLDER_PNG_B64, "base64");

  const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    forcePathStyle: true,
    credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: body,
      ContentType: "image/png",
    }),
  );
  log(`  uploaded placeholder to s3://${S3_BUCKET}/${s3Key}`);

  const now = new Date();
  await mediaPool.query(
    `INSERT INTO media_assets
      (id, s3_key, content_type, size_bytes, width, height, status,
       uploaded_by, alt_text, retry_count, created_at, updated_at, confirmed_at, ready_at)
     VALUES ($1, $2, 'image/png', $3, 1, 1, 'ready', $4, 'Storm placeholder',
             0, $5, $5, $5, $5)`,
    [mediaId, s3Key, body.length, ADMIN_HEADER_USER_ID, now],
  );
  log(`  inserted media_assets row id=${mediaId}`);

  placeholderMediaId = mediaId;
  return mediaId;
}

// =============================================================================
// CATALOG: categories + brands + products via admin HTTP endpoints.
// Catalog publishes Kafka events so search-service indexes automatically.
// =============================================================================

interface ApiOpts {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

async function adminFetch<T>(base: string, path: string, opts: ApiOpts = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-user-id": ADMIN_HEADER_USER_ID,
    "x-user-role": "admin",
  };
  if (method !== "GET") {
    headers["idempotency-key"] = uuidv7();
  }
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

const categoryIdByKey = new Map<string, string>();
const brandIdByKey = new Map<string, string>();
const productBySku = new Map<
  string,
  {
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    primaryImageMediaId: string | null;
  }
>();

async function seedCategories(): Promise<void> {
  for (const cat of CATEGORIES) {
    const created = await adminFetch<{ id: string }>(
      CATALOG_BASE,
      "/api/admin/categories",
      { method: "POST", body: { name: cat.name, slug: cat.slug } },
    );
    categoryIdByKey.set(cat.key, created.id);
    log(`  + category ${cat.name}`);
    for (const child of cat.children ?? []) {
      const c = await adminFetch<{ id: string }>(
        CATALOG_BASE,
        "/api/admin/categories",
        {
          method: "POST",
          body: { name: child.name, slug: child.slug, parentId: created.id },
        },
      );
      categoryIdByKey.set(child.key, c.id);
      log(`    + sub ${child.name}`);
    }
  }
}

async function seedBrands(): Promise<void> {
  for (const b of BRANDS) {
    const created = await adminFetch<{ id: string }>(CATALOG_BASE, "/api/admin/brands", {
      method: "POST",
      body: { name: b.name, slug: b.slug },
    });
    brandIdByKey.set(b.key, created.id);
    log(`  + brand ${b.name}`);
  }
}

async function seedProducts(mediaId: string): Promise<void> {
  for (const p of PRODUCTS) {
    const brandId = brandIdByKey.get(p.brandKey);
    const categoryId = categoryIdByKey.get(p.categoryKey);
    if (!brandId || !categoryId) {
      throw new Error(`Product ${p.sku}: unknown brand/category`);
    }
    const created = await adminFetch<{ id: string }>(CATALOG_BASE, "/api/admin/products", {
      method: "POST",
      body: {
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        description: p.description,
        brandId,
        categoryId,
        basePrice: p.basePrice,
        currency: "INR",
        attributes: p.attributes,
      },
    });
    productBySku.set(p.sku, {
      id: created.id,
      slug: p.slug,
      name: p.name,
      basePrice: p.basePrice,
      primaryImageMediaId: mediaId,
    });

    for (const v of p.variants ?? []) {
      await adminFetch(CATALOG_BASE, `/api/admin/products/${created.id}/variants`, {
        method: "POST",
        body: {
          sku: v.sku,
          name: v.name,
          ...(v.price !== undefined ? { price: v.price } : {}),
          ...(v.attributes ? { attributes: v.attributes } : {}),
        },
      });
    }

    await adminFetch(CATALOG_BASE, `/api/admin/products/${created.id}/media`, {
      method: "POST",
      body: { mediaId, order: 0, isPrimary: true },
    });

    await adminFetch(CATALOG_BASE, `/api/admin/products/${created.id}/publish`, {
      method: "POST",
      body: {},
    });

    log(`  ✓ ${p.sku.padEnd(28)} ${p.name}`);
  }
}

// =============================================================================
// INVENTORY: stock per SKU (includes variants).
// =============================================================================

async function seedInventory(): Promise<void> {
  // Primary product SKUs: catalog publishes events for these; inventory will
  // create the stock_items row asynchronously, so retry with backoff.
  for (const p of PRODUCTS) {
    let ok = false;
    let lastErr: unknown;
    for (let attempt = 0; attempt < 8 && !ok; attempt++) {
      try {
        await adminFetch(INVENTORY_BASE, `/api/admin/stock/${encodeURIComponent(p.sku)}`, {
          method: "PATCH",
          body: { delta: p.stock, reason: "Initial seed" },
        });
        ok = true;
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    if (!ok) {
      log(`  ! stock for ${p.sku} failed: ${(lastErr as Error).message}`);
    }
  }
  // Variant SKUs: catalog does not currently publish per-variant inventory
  // events. Try once, fail silently — variants will appear in PDP but show
  // unavailable. Acceptable for a UI demo.
  for (const p of PRODUCTS) {
    for (const v of p.variants ?? []) {
      try {
        await adminFetch(INVENTORY_BASE, `/api/admin/stock/${encodeURIComponent(v.sku)}`, {
          method: "PATCH",
          body: { delta: p.stock, reason: "Initial seed" },
        });
      } catch {
        // variant SKUs may not have inventory rows; skip silently
      }
    }
  }
  log(`  set stock for ${PRODUCTS.length} primary SKUs (variants best-effort)`);
}

// =============================================================================
// IDENTITY: users + addresses (direct DB write to bypass password rules)
// =============================================================================

const userIdByEmail = new Map<string, string>();
const addressIdsByUser = new Map<string, string[]>();

async function seedUsers(): Promise<void> {
  for (const u of USERS) {
    const userId = uuidv7();
    const hash = await argon2.hash(u.password, ARGON2_OPTIONS);
    await identityPool.query(
      `INSERT INTO users
        (id, email, password_hash, name, mobile,
         mobile_verified, email_verified, role, blocked, token_version,
         created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, FALSE, TRUE, 'customer', FALSE, 0, NOW(), NOW())`,
      [userId, u.email, hash, u.name, u.mobile ?? null],
    );
    userIdByEmail.set(u.email, userId);
    log(`  + user ${u.email}`);
    await seedAddressesFor(userId, u);
  }
}

async function seedAddressesFor(userId: string, u: SeedUser): Promise<void> {
  const addressIds: string[] = [];
  for (const a of u.addresses ?? []) {
    const id = uuidv7();
    await identityPool.query(
      `INSERT INTO addresses
        (id, user_id, label, full_name, mobile, line1, line2, landmark,
         city, state, pincode, country, is_default, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'IN',$12,NOW(),NOW())`,
      [
        id,
        userId,
        a.label,
        a.fullName,
        a.mobile,
        a.line1,
        a.line2 ?? null,
        a.landmark ?? null,
        a.city,
        a.state,
        a.pincode,
        a.isDefault ?? false,
      ],
    );
    addressIds.push(id);
  }
  addressIdsByUser.set(userId, addressIds);
}

// =============================================================================
// WISHLIST + CART + ORDERS — populated for abhi only.
// =============================================================================

async function seedWishlistForAbhi(abhiId: string): Promise<void> {
  await wishlistPool.query(
    `INSERT INTO wishlists (user_id, created_at, updated_at)
     VALUES ($1, NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [abhiId],
  );
  for (const sku of ABHI_WISHLIST_SKUS) {
    const p = productBySku.get(sku);
    if (!p) {
      log(`  ! wishlist sku ${sku} not found, skipping`);
      continue;
    }
    await wishlistPool.query(
      `INSERT INTO wishlist_items (wishlist_id, sku, product_id, added_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (wishlist_id, sku) DO NOTHING`,
      [abhiId, sku, p.id],
    );
  }
  log(`  ✓ wishlist seeded for abhi (${ABHI_WISHLIST_SKUS.length} items)`);
}

async function seedCartForAbhi(abhiId: string): Promise<void> {
  const redis = new Redis(REDIS_URL);
  const items = ABHI_CART_SKUS.flatMap((sku) => {
    const p = productBySku.get(sku);
    if (!p) return [];
    return [
      {
        sku,
        productId: p.id,
        variantId: null,
        name: p.name,
        slug: p.slug,
        primaryMediaId: p.primaryImageMediaId,
        qty: 1,
        priceSnapshot: p.basePrice,
        currency: "INR",
        addedAt: new Date().toISOString(),
      },
    ];
  });
  if (items.length > 0) {
    const key = `cart:${abhiId}`;
    await redis.hset(key, {
      items: JSON.stringify(items),
      updatedAt: new Date().toISOString(),
    });
    await redis.expire(key, 60 * 60 * 24 * 30);
    log(`  ✓ cart seeded for abhi (${items.length} items)`);
  }
  await redis.quit();
}

async function seedOrdersForAbhi(abhiId: string): Promise<void> {
  const abhi = USERS.find((u) => u.email === ABHI_EMAIL);
  if (!abhi) return;
  const primary = abhi.addresses?.find((a) => a.isDefault) ?? abhi.addresses?.[0];
  if (!primary) return;

  for (const ord of ABHI_PAST_ORDERS) {
    const orderId = uuidv7();
    const placedAt = new Date(Date.now() - ord.daysAgo * 24 * 60 * 60 * 1000);
    const items = ord.skus.flatMap((s) => {
      const p = productBySku.get(s.sku);
      if (!p) return [];
      return [
        {
          id: uuidv7(),
          sku: s.sku,
          productId: p.id,
          name: p.name,
          unitPricePaise: p.basePrice,
          qty: s.qty,
          lineTotalPaise: p.basePrice * s.qty,
        },
      ];
    });
    if (items.length === 0) continue;

    const subtotal = items.reduce((a, i) => a + i.lineTotalPaise, 0);
    const shipping = subtotal >= 50_000 ? 0 : 5_000;
    const total = subtotal + shipping;
    const addressSnapshot = addressSnapshotFor(primary);

    await orderPool.query(
      `INSERT INTO orders
        (id, user_id, status, items_count,
         subtotal_paise, shipping_fee_paise, total_amount_paise, currency,
         address_snapshot, payment_method, idempotency_key,
         customer_email, customer_name, created_at, updated_at, confirmed_at)
       VALUES ($1,$2,$3::"OrderStatus",$4,$5,$6,$7,'INR',$8::jsonb,'razorpay',$9,$10,$11,$12,$12,$12)`,
      [
        orderId,
        abhiId,
        ord.status,
        items.reduce((a, i) => a + i.qty, 0),
        subtotal,
        shipping,
        total,
        JSON.stringify(addressSnapshot),
        `seed-${orderId}`,
        abhi.email,
        abhi.name,
        placedAt,
      ],
    );

    for (const it of items) {
      await orderPool.query(
        `INSERT INTO order_items
          (id, order_id, sku, product_id, name,
           unit_price_paise, qty, line_total_paise)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [it.id, orderId, it.sku, it.productId, it.name, it.unitPricePaise, it.qty, it.lineTotalPaise],
      );
    }

    // Walk the status history: pending_payment → confirmed → processing → shipped → delivered
    const trail: { from: string | null; to: string }[] = [
      { from: null, to: "pending_payment" },
      { from: "pending_payment", to: "confirmed" },
    ];
    if (ord.status === "processing" || ord.status === "shipped" || (ord.status as string) === "delivered") {
      trail.push({ from: "confirmed", to: "processing" });
    }
    if (ord.status === "shipped" || (ord.status as string) === "delivered") {
      trail.push({ from: "processing", to: "shipped" });
    }
    if ((ord.status as string) === "delivered") {
      trail.push({ from: "shipped", to: "delivered" });
    }
    let ts = placedAt.getTime();
    for (const step of trail) {
      ts += 2 * 60 * 60 * 1000; // each step 2h apart
      await orderPool.query(
        `INSERT INTO order_status_history
          (id, order_id, from_status, to_status, changed_at, changed_by)
         VALUES ($1,$2,$3::"OrderStatus",$4::"OrderStatus",$5,'system')`,
        [uuidv7(), orderId, step.from, step.to, new Date(ts)],
      );
    }

    log(`  ✓ order ${orderId.slice(0, 8)} ${ord.status} (${items.length} items)`);
  }
}

function addressSnapshotFor(a: SeedAddress) {
  return {
    addressId: uuidv7(),
    label: a.label,
    fullName: a.fullName,
    phone: a.mobile,
    line1: a.line1,
    line2: a.line2 ?? null,
    landmark: a.landmark ?? null,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    country: "IN",
  };
}

// =============================================================================
// Orchestrator
// =============================================================================

async function main(): Promise<void> {
  log("starting Storm seed");

  log("waiting for postgres pools…");
  await Promise.all([
    waitForPg(identityPool, "identity"),
    waitForPg(wishlistPool, "wishlist"),
    waitForPg(orderPool, "order"),
    waitForPg(mediaPool, "media"),
  ]);

  if (await alreadySeeded()) {
    log(`abhi@gmail.com already exists — seed already applied. Exiting.`);
    await closeAll();
    return;
  }

  log("waiting for services…");
  await Promise.all([
    waitFor("catalog", `${CATALOG_BASE}/health`),
    waitFor("inventory", `${INVENTORY_BASE}/health`),
    waitFor("identity", `${IDENTITY_BASE}/health`),
    waitFor("media", `${MEDIA_BASE}/health`),
  ]);

  log("seeding placeholder media…");
  const mediaId = await seedPlaceholderMedia();

  log("seeding categories…");
  await seedCategories();

  log("seeding brands…");
  await seedBrands();

  log(`seeding ${PRODUCTS.length} products…`);
  await seedProducts(mediaId);

  log("seeding inventory…");
  await seedInventory();

  log("seeding users + addresses…");
  await seedUsers();

  const abhiId = userIdByEmail.get(ABHI_EMAIL);
  if (!abhiId) throw new Error("abhi user id missing after seed");

  log("seeding wishlist for abhi…");
  await seedWishlistForAbhi(abhiId);

  log("seeding cart for abhi…");
  await seedCartForAbhi(abhiId);

  log("seeding past orders for abhi…");
  await seedOrdersForAbhi(abhiId);

  log("✅ seed complete");
  log(`   Login: ${ABHI_EMAIL} / ${ABHI_PASSWORD}`);
  await closeAll();
}

async function closeAll(): Promise<void> {
  await Promise.allSettled([
    identityPool.end(),
    wishlistPool.end(),
    orderPool.end(),
    mediaPool.end(),
  ]);
}

main().catch(async (err) => {
  console.error("[seed] FAILED", err);
  await closeAll();
  process.exit(1);
});
