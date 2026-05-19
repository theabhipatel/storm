import type { PrismaClient, Prisma, Product, Variant, ProductMedia } from "../db.js";
import {
  StormError,
  ErrorCodes,
  CatalogEventTypes,
  type AdminProductSummary,
  type ProductDetail,
} from "@storm/contracts";
import { uuidv7 } from "uuidv7";

import { appendOutbox } from "../outbox/writer.js";
import { slugify } from "./slug.js";

export interface ProductCreateInput {
  sku: string;
  slug?: string | undefined;
  name: string;
  description?: string | undefined;
  brandId: string;
  categoryId: string;
  basePrice: number;
  currency?: "INR" | undefined;
  attributes?: Record<string, string | number | boolean> | undefined;
}

export interface ProductUpdateInput {
  sku?: string | undefined;
  slug?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  brandId?: string | undefined;
  categoryId?: string | undefined;
  basePrice?: number | undefined;
  currency?: "INR" | undefined;
  attributes?: Record<string, string | number | boolean> | undefined;
}

export interface ListFilters {
  q?: string | undefined;
  status?: "draft" | "published" | "archived" | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  page: number;
  pageSize: number;
}

export interface VariantInput {
  sku: string;
  name: string;
  price?: number | null | undefined;
  attributes?: Record<string, string | number | boolean> | undefined;
}

export interface VariantUpdateInput {
  sku?: string | undefined;
  name?: string | undefined;
  price?: number | null | undefined;
  attributes?: Record<string, string | number | boolean> | undefined;
}

export function productService(prisma: PrismaClient) {
  async function list(filters: ListFilters): Promise<{
    items: AdminProductSummary[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const where: Prisma.ProductWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.q) {
      const q = filters.q.trim();
      if (q.length > 0) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ];
      }
    }
    const skip = (filters.page - 1) * filters.pageSize;
    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: filters.pageSize,
        include: {
          media: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);
    return {
      items: rows.map((r) => toSummary(r, r.media[0])),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async function getById(id: string): Promise<ProductDetail> {
    const row = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { createdAt: "asc" } },
        media: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      },
    });
    if (!row) throw notFound("Product");
    return toDetail(row);
  }

  async function getBySlugPublished(slug: string): Promise<ProductDetail> {
    const row = await prisma.product.findFirst({
      where: { slug, status: "published" },
      include: {
        variants: { orderBy: { createdAt: "asc" } },
        media: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      },
    });
    if (!row) throw notFound("Product");
    return toDetail(row);
  }

  async function create(input: ProductCreateInput): Promise<ProductDetail> {
    const slug = (input.slug ?? slugify(input.name)).trim();
    if (!slug) {
      throw new StormError({
        code: ErrorCodes.VALIDATION_FAILED,
        message: "Product slug could not be derived from name.",
        status: 422,
      });
    }
    // Validate FK presence up-front for friendlier errors.
    const [brand, category] = await Promise.all([
      prisma.brand.findUnique({ where: { id: input.brandId }, select: { id: true } }),
      prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } }),
    ]);
    if (!brand) throw notFound("Brand");
    if (!category) throw notFound("Category");

    const id = uuidv7();
    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            id,
            sku: input.sku,
            slug,
            name: input.name,
            description: input.description ?? "",
            brandId: input.brandId,
            categoryId: input.categoryId,
            basePrice: input.basePrice,
            currency: input.currency ?? "INR",
            status: "draft",
            attributes: (input.attributes ?? {}) as Prisma.InputJsonValue,
          },
          include: {
            variants: true,
            media: true,
          },
        });
        await appendOutbox(tx, {
          aggregateId: id,
          eventType: CatalogEventTypes.ProductCreated,
          payload: snapshot(created),
        });
        return toDetail(created);
      });
    } catch (err) {
      throw mapProductUnique(err);
    }
  }

  async function update(id: string, input: ProductUpdateInput): Promise<ProductDetail> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw notFound("Product");

    if (input.brandId && input.brandId !== existing.brandId) {
      const b = await prisma.brand.findUnique({
        where: { id: input.brandId },
        select: { id: true },
      });
      if (!b) throw notFound("Brand");
    }
    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const c = await prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });
      if (!c) throw notFound("Category");
    }

    const data: Prisma.ProductUpdateInput = {};
    const changed: string[] = [];
    if (input.sku !== undefined && input.sku !== existing.sku) {
      data.sku = input.sku;
      changed.push("sku");
    }
    if (input.slug !== undefined && input.slug !== existing.slug) {
      data.slug = input.slug;
      changed.push("slug");
    }
    if (input.name !== undefined && input.name !== existing.name) {
      data.name = input.name;
      changed.push("name");
    }
    if (input.description !== undefined && input.description !== existing.description) {
      data.description = input.description;
      changed.push("description");
    }
    if (input.brandId !== undefined && input.brandId !== existing.brandId) {
      data.brand = { connect: { id: input.brandId } };
      changed.push("brandId");
    }
    if (input.categoryId !== undefined && input.categoryId !== existing.categoryId) {
      data.category = { connect: { id: input.categoryId } };
      changed.push("categoryId");
    }
    if (input.basePrice !== undefined && input.basePrice !== existing.basePrice) {
      data.basePrice = input.basePrice;
      changed.push("basePrice");
    }
    if (input.currency !== undefined && input.currency !== existing.currency) {
      data.currency = input.currency;
      changed.push("currency");
    }
    if (input.attributes !== undefined) {
      data.attributes = input.attributes as Prisma.InputJsonValue;
      changed.push("attributes");
    }

    if (changed.length === 0) return getById(id);

    try {
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
          where: { id },
          data,
          include: {
            variants: { orderBy: { createdAt: "asc" } },
            media: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
          },
        });
        await appendOutbox(tx, {
          aggregateId: id,
          eventType: CatalogEventTypes.ProductUpdated,
          payload: { ...snapshot(updated), changedFields: changed },
        });
        return toDetail(updated);
      });
    } catch (err) {
      throw mapProductUnique(err);
    }
  }

  // --- variants ---

  async function addVariant(productId: string, input: VariantInput) {
    await ensureExists(prisma, productId);
    const id = uuidv7();
    try {
      const created = await prisma.$transaction(async (tx) => {
        const v = await tx.variant.create({
          data: {
            id,
            productId,
            sku: input.sku,
            name: input.name,
            price: input.price ?? null,
            attributes: (input.attributes ?? {}) as Prisma.InputJsonValue,
          },
        });
        const p = await tx.product.findUnique({
          where: { id: productId },
          include: { variants: true, media: true },
        });
        await appendOutbox(tx, {
          aggregateId: productId,
          eventType: CatalogEventTypes.ProductUpdated,
          payload: { ...snapshot(p!), changedFields: ["variant.added"] },
        });
        return v;
      });
      return toVariantDto(created);
    } catch (err) {
      throw mapProductUnique(err);
    }
  }

  async function updateVariant(
    productId: string,
    variantId: string,
    input: VariantUpdateInput,
  ) {
    const variant = await prisma.variant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) throw notFound("Variant");

    const data: Prisma.VariantUpdateInput = {};
    if (input.sku !== undefined) data.sku = input.sku;
    if (input.name !== undefined) data.name = input.name;
    if (input.price !== undefined) data.price = input.price;
    if (input.attributes !== undefined) {
      data.attributes = input.attributes as Prisma.InputJsonValue;
    }
    if (Object.keys(data).length === 0) return toVariantDto(variant);

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.variant.update({ where: { id: variantId }, data });
        const p = await tx.product.findUnique({
          where: { id: productId },
          include: { variants: true, media: true },
        });
        await appendOutbox(tx, {
          aggregateId: productId,
          eventType: CatalogEventTypes.ProductUpdated,
          payload: { ...snapshot(p!), changedFields: ["variant.updated"] },
        });
        return v;
      });
      return toVariantDto(updated);
    } catch (err) {
      throw mapProductUnique(err);
    }
  }

  async function removeVariant(productId: string, variantId: string) {
    const variant = await prisma.variant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) throw notFound("Variant");
    await prisma.$transaction(async (tx) => {
      await tx.variant.delete({ where: { id: variantId } });
      const p = await tx.product.findUnique({
        where: { id: productId },
        include: { variants: true, media: true },
      });
      await appendOutbox(tx, {
        aggregateId: productId,
        eventType: CatalogEventTypes.ProductUpdated,
        payload: { ...snapshot(p!), changedFields: ["variant.removed"] },
      });
    });
  }

  // --- media ---

  async function attachMedia(
    productId: string,
    input: { mediaId: string; order?: number | undefined; isPrimary?: boolean | undefined },
  ) {
    await ensureExists(prisma, productId);
    const existing = await prisma.productMedia.findMany({ where: { productId } });
    const isFirst = existing.length === 0;
    const order = input.order ?? existing.length;
    const isPrimary = input.isPrimary ?? isFirst;

    await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.productMedia.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }
      await tx.productMedia.upsert({
        where: { productId_mediaId: { productId, mediaId: input.mediaId } },
        update: { order, isPrimary },
        create: { productId, mediaId: input.mediaId, order, isPrimary },
      });
      const p = await tx.product.findUnique({
        where: { id: productId },
        include: { variants: true, media: true },
      });
      await appendOutbox(tx, {
        aggregateId: productId,
        eventType: CatalogEventTypes.ProductUpdated,
        payload: { ...snapshot(p!), changedFields: ["media.attached"] },
      });
    });
  }

  async function detachMedia(productId: string, mediaId: string) {
    const row = await prisma.productMedia.findUnique({
      where: { productId_mediaId: { productId, mediaId } },
    });
    if (!row) throw notFound("Product media");
    await prisma.$transaction(async (tx) => {
      await tx.productMedia.delete({
        where: { productId_mediaId: { productId, mediaId } },
      });
      // If we removed the primary, promote the next image (lowest order).
      if (row.isPrimary) {
        const next = await tx.productMedia.findFirst({
          where: { productId },
          orderBy: { order: "asc" },
        });
        if (next) {
          await tx.productMedia.update({
            where: { productId_mediaId: { productId, mediaId: next.mediaId } },
            data: { isPrimary: true },
          });
        }
      }
      const p = await tx.product.findUnique({
        where: { id: productId },
        include: { variants: true, media: true },
      });
      await appendOutbox(tx, {
        aggregateId: productId,
        eventType: CatalogEventTypes.ProductUpdated,
        payload: { ...snapshot(p!), changedFields: ["media.detached"] },
      });
    });
  }

  return {
    list,
    getById,
    getBySlugPublished,
    create,
    update,
    addVariant,
    updateVariant,
    removeVariant,
    attachMedia,
    detachMedia,
  };
}

// ----- helpers -----

type ProductRow = Product & { variants?: Variant[]; media?: ProductMedia[] };

function snapshot(p: ProductRow) {
  return {
    productId: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    brandId: p.brandId,
    categoryId: p.categoryId,
    basePrice: p.basePrice,
    currency: p.currency,
    status: p.status,
  };
}

function toSummary(p: Product, primaryMedia: ProductMedia | undefined): AdminProductSummary {
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    status: p.status,
    brandId: p.brandId,
    categoryId: p.categoryId,
    basePrice: p.basePrice,
    currency: p.currency,
    primaryMediaId: primaryMedia?.mediaId ?? null,
    updatedAt: p.updatedAt.toISOString(),
  };
}

function toDetail(p: ProductRow): ProductDetail {
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    description: p.description,
    brandId: p.brandId,
    categoryId: p.categoryId,
    basePrice: p.basePrice,
    currency: p.currency,
    status: p.status,
    attributes: (p.attributes ?? {}) as Record<string, string | number | boolean>,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    variants: (p.variants ?? []).map(toVariantDto),
    media: (p.media ?? []).map((m) => ({
      mediaId: m.mediaId,
      order: m.order,
      isPrimary: m.isPrimary,
    })),
  };
}

function toVariantDto(v: Variant) {
  return {
    id: v.id,
    productId: v.productId,
    sku: v.sku,
    name: v.name,
    price: v.price,
    attributes: (v.attributes ?? {}) as Record<string, string | number | boolean>,
  };
}

async function ensureExists(prisma: PrismaClient, id: string): Promise<void> {
  const row = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!row) throw notFound("Product");
}

function notFound(what: string): StormError {
  return new StormError({
    code: ErrorCodes.NOT_FOUND,
    message: `${what} not found.`,
    status: 404,
  });
}

function mapProductUnique(err: unknown): StormError {
  if (
    err instanceof Error &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  ) {
    const target = (err as { meta?: { target?: string[] } }).meta?.target?.[0] ?? "field";
    if (target.includes("sku")) {
      return new StormError({
        code: ErrorCodes.SKU_TAKEN,
        message: "SKU already in use.",
        status: 409,
      });
    }
    return new StormError({
      code: ErrorCodes.SLUG_TAKEN,
      message: "Slug already in use.",
      status: 409,
    });
  }
  if (err instanceof StormError) return err;
  throw err as Error;
}
