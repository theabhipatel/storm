import type { PrismaClient } from "../db.js";
import {
  StormError,
  ErrorCodes,
  CatalogEventTypes,
  type ProductDetail,
} from "@storm/contracts";

import { appendOutbox } from "../outbox/writer.js";
import { productService } from "./productService.js";

export function lifecycleService(prisma: PrismaClient) {
  const products = productService(prisma);

  async function publish(productId: string): Promise<ProductDetail> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { media: { take: 1 } },
    });
    if (!product) throw notFound();
    if (product.status !== "draft" && product.status !== "archived") {
      throw invalidTransition(product.status, "published");
    }
    if (product.basePrice <= 0 || product.media.length === 0) {
      throw new StormError({
        code: ErrorCodes.PUBLISH_REQUIREMENTS_NOT_MET,
        message: "Product needs at least one image and a positive base price.",
        status: 422,
        details: {
          hasImage: product.media.length > 0,
          hasPrice: product.basePrice > 0,
        },
      });
    }
    const publishedAt = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { status: "published", publishedAt },
      });
      await appendOutbox(tx, {
        aggregateId: productId,
        eventType: CatalogEventTypes.ProductPublished,
        payload: {
          productId: product.id,
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          brandId: product.brandId,
          categoryId: product.categoryId,
          basePrice: product.basePrice,
          currency: product.currency,
          status: "published",
          publishedAt: publishedAt.toISOString(),
        },
      });
    });
    return products.getById(productId);
  }

  async function archive(productId: string): Promise<ProductDetail> {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw notFound();
    if (product.status !== "published") {
      throw invalidTransition(product.status, "archived");
    }
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { status: "archived" },
      });
      await appendOutbox(tx, {
        aggregateId: productId,
        eventType: CatalogEventTypes.ProductArchived,
        payload: {
          productId: product.id,
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          brandId: product.brandId,
          categoryId: product.categoryId,
          basePrice: product.basePrice,
          currency: product.currency,
          status: "archived",
        },
      });
    });
    return products.getById(productId);
  }

  async function restore(productId: string): Promise<ProductDetail> {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw notFound();
    if (product.status !== "archived") {
      throw invalidTransition(product.status, "draft");
    }
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { status: "draft", publishedAt: null },
      });
      await appendOutbox(tx, {
        aggregateId: productId,
        eventType: CatalogEventTypes.ProductUpdated,
        payload: {
          productId: product.id,
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          brandId: product.brandId,
          categoryId: product.categoryId,
          basePrice: product.basePrice,
          currency: product.currency,
          status: "draft",
          changedFields: ["status"],
        },
      });
    });
    return products.getById(productId);
  }

  return { publish, archive, restore };
}

function notFound(): StormError {
  return new StormError({
    code: ErrorCodes.NOT_FOUND,
    message: "Product not found.",
    status: 404,
  });
}

function invalidTransition(from: string, to: string): StormError {
  return new StormError({
    code: ErrorCodes.INVALID_STATE_TRANSITION,
    message: `Cannot transition product from ${from} to ${to}.`,
    status: 409,
  });
}
