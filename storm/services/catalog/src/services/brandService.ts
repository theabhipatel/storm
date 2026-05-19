import type { PrismaClient, Brand } from "../db.js";
import { StormError, ErrorCodes, CatalogEventTypes } from "@storm/contracts";
import { uuidv7 } from "uuidv7";

import { appendOutbox } from "../outbox/writer.js";
import { slugify } from "./slug.js";

export interface BrandCreateInput {
  name: string;
  slug?: string | undefined;
}

export interface BrandUpdateInput {
  name?: string | undefined;
  slug?: string | undefined;
}

export function brandService(prisma: PrismaClient) {
  async function list() {
    const rows = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return rows.map(toDto);
  }

  async function create(input: BrandCreateInput) {
    const slug = (input.slug ?? slugify(input.name)).trim();
    if (!slug) {
      throw new StormError({
        code: ErrorCodes.VALIDATION_FAILED,
        message: "Brand slug could not be derived from name.",
        status: 422,
      });
    }
    const id = uuidv7();
    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.brand.create({
          data: { id, name: input.name, slug },
        });
        await appendOutbox(tx, {
          aggregateId: id,
          eventType: CatalogEventTypes.BrandCreated,
          payload: { brandId: id, name: created.name, slug: created.slug },
        });
        return toDto(created);
      });
    } catch (err) {
      throw mapUniqueConstraint(err, "Brand");
    }
  }

  async function update(id: string, input: BrandUpdateInput) {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) throw notFound("Brand");
    const data: { name?: string; slug?: string } = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (Object.keys(data).length === 0) return toDto(brand);

    try {
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.brand.update({ where: { id }, data });
        await appendOutbox(tx, {
          aggregateId: id,
          eventType: CatalogEventTypes.BrandUpdated,
          payload: { brandId: id, name: updated.name, slug: updated.slug },
        });
        return toDto(updated);
      });
    } catch (err) {
      throw mapUniqueConstraint(err, "Brand");
    }
  }

  async function remove(id: string) {
    const count = await prisma.product.count({ where: { brandId: id } });
    if (count > 0) {
      throw new StormError({
        code: ErrorCodes.BRAND_HAS_PRODUCTS,
        message: "Cannot delete brand with attached products.",
        status: 409,
      });
    }
    await prisma.brand.delete({ where: { id } }).catch(() => {
      throw notFound("Brand");
    });
  }

  return { list, create, update, remove };
}

function toDto(b: Brand) {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

function notFound(what: string): StormError {
  return new StormError({
    code: ErrorCodes.NOT_FOUND,
    message: `${what} not found.`,
    status: 404,
  });
}

function mapUniqueConstraint(err: unknown, what: string): StormError {
  if (
    err instanceof Error &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  ) {
    const target = (err as { meta?: { target?: string[] } }).meta?.target?.[0];
    return new StormError({
      code: ErrorCodes.SLUG_TAKEN,
      message: `${what} ${target ?? "field"} already in use.`,
      status: 409,
    });
  }
  if (err instanceof StormError) return err;
  throw err as Error;
}
