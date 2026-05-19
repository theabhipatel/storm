import type { PrismaClient, Category } from "../db.js";
import { StormError, ErrorCodes, CatalogEventTypes } from "@storm/contracts";
import type { CategoryTreeNode } from "@storm/contracts";
import { uuidv7 } from "uuidv7";

import { appendOutbox } from "../outbox/writer.js";
import { slugify } from "./slug.js";

const MAX_DEPTH = 3;

export interface CategoryCreateInput {
  name: string;
  slug?: string | undefined;
  parentId?: string | null | undefined;
  order?: number;
}

export interface CategoryUpdateInput {
  name?: string | undefined;
  slug?: string | undefined;
  parentId?: string | null | undefined;
  order?: number | undefined;
}

export function categoryService(prisma: PrismaClient) {
  async function tree(): Promise<CategoryTreeNode[]> {
    const rows = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return buildTree(rows);
  }

  async function getDepth(parentId: string | null): Promise<number> {
    if (!parentId) return 1;
    let depth = 1;
    let cursor: string | null = parentId;
    while (cursor) {
      depth += 1;
      if (depth > MAX_DEPTH) return depth;
      const parent: { parentId: string | null } | null = await prisma.category.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      if (!parent) {
        throw notFound("Parent category");
      }
      cursor = parent.parentId;
    }
    return depth;
  }

  async function create(input: CategoryCreateInput) {
    const parentId = input.parentId ?? null;
    const depth = await getDepth(parentId);
    if (depth > MAX_DEPTH) {
      throw new StormError({
        code: ErrorCodes.CATEGORY_DEPTH_EXCEEDED,
        message: `Categories cannot nest deeper than ${MAX_DEPTH} levels.`,
        status: 422,
      });
    }
    const slug = (input.slug ?? slugify(input.name)).trim();
    if (!slug) {
      throw new StormError({
        code: ErrorCodes.VALIDATION_FAILED,
        message: "Category slug could not be derived from name.",
        status: 422,
      });
    }
    const id = uuidv7();
    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.category.create({
          data: {
            id,
            name: input.name,
            slug,
            parentId,
            order: input.order ?? 0,
          },
        });
        await appendOutbox(tx, {
          aggregateId: id,
          eventType: CatalogEventTypes.CategoryCreated,
          payload: {
            categoryId: id,
            name: created.name,
            slug: created.slug,
            parentId: created.parentId,
          },
        });
        return toDto(created);
      });
    } catch (err) {
      throw mapUnique(err, "Category");
    }
  }

  async function update(id: string, input: CategoryUpdateInput) {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw notFound("Category");

    // Prevent cycles + enforce depth if parent changes.
    if (input.parentId !== undefined && input.parentId !== cat.parentId) {
      if (input.parentId === id) {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "A category cannot be its own parent.",
          status: 422,
        });
      }
      if (input.parentId) {
        const cycleHit = await isDescendant(prisma, id, input.parentId);
        if (cycleHit) {
          throw new StormError({
            code: ErrorCodes.VALIDATION_FAILED,
            message: "Cannot move a category under one of its descendants.",
            status: 422,
          });
        }
        const newDepth = await getDepth(input.parentId);
        const subtreeDepth = await maxSubtreeDepth(prisma, id);
        if (newDepth + subtreeDepth - 1 > MAX_DEPTH) {
          throw new StormError({
            code: ErrorCodes.CATEGORY_DEPTH_EXCEEDED,
            message: `Categories cannot nest deeper than ${MAX_DEPTH} levels.`,
            status: 422,
          });
        }
      }
    }

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data["name"] = input.name;
    if (input.slug !== undefined) data["slug"] = input.slug;
    if (input.parentId !== undefined) data["parentId"] = input.parentId;
    if (input.order !== undefined) data["order"] = input.order;
    if (Object.keys(data).length === 0) return toDto(cat);

    try {
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.category.update({ where: { id }, data });
        await appendOutbox(tx, {
          aggregateId: id,
          eventType: CatalogEventTypes.CategoryUpdated,
          payload: {
            categoryId: id,
            name: updated.name,
            slug: updated.slug,
            parentId: updated.parentId,
          },
        });
        return toDto(updated);
      });
    } catch (err) {
      throw mapUnique(err, "Category");
    }
  }

  async function remove(id: string) {
    const [childCount, productCount] = await Promise.all([
      prisma.category.count({ where: { parentId: id } }),
      prisma.product.count({ where: { categoryId: id } }),
    ]);
    if (childCount > 0) {
      throw new StormError({
        code: ErrorCodes.CATEGORY_HAS_CHILDREN,
        message: "Cannot delete category with child categories.",
        status: 409,
      });
    }
    if (productCount > 0) {
      throw new StormError({
        code: ErrorCodes.CATEGORY_HAS_PRODUCTS,
        message: "Cannot delete category with attached products.",
        status: 409,
      });
    }
    await prisma.category.delete({ where: { id } }).catch(() => {
      throw notFound("Category");
    });
  }

  return { tree, create, update, remove };
}

function toDto(c: Category) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    order: c.order,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

function buildTree(rows: Category[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, Category[]>();
  for (const row of rows) {
    const list = byParent.get(row.parentId) ?? [];
    list.push(row);
    byParent.set(row.parentId, list);
  }
  const make = (parentId: string | null): CategoryTreeNode[] => {
    const list = byParent.get(parentId) ?? [];
    return list.map((c) => ({ ...toDto(c), children: make(c.id) }));
  };
  return make(null);
}

async function isDescendant(
  prisma: PrismaClient,
  ancestorId: string,
  candidateId: string,
): Promise<boolean> {
  let cursor: string | null = candidateId;
  while (cursor) {
    if (cursor === ancestorId) return true;
    const parent: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: cursor },
      select: { parentId: true },
    });
    cursor = parent?.parentId ?? null;
  }
  return false;
}

async function maxSubtreeDepth(prisma: PrismaClient, rootId: string): Promise<number> {
  const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const childrenOf = new Map<string, string[]>();
  for (const c of all) {
    if (c.parentId) {
      const list = childrenOf.get(c.parentId) ?? [];
      list.push(c.id);
      childrenOf.set(c.parentId, list);
    }
  }
  const walk = (node: string): number => {
    const kids = childrenOf.get(node) ?? [];
    if (kids.length === 0) return 1;
    return 1 + Math.max(...kids.map(walk));
  };
  return walk(rootId);
}

function notFound(what: string): StormError {
  return new StormError({
    code: ErrorCodes.NOT_FOUND,
    message: `${what} not found.`,
    status: 404,
  });
}

function mapUnique(err: unknown, what: string): StormError {
  if (
    err instanceof Error &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  ) {
    return new StormError({
      code: ErrorCodes.SLUG_TAKEN,
      message: `${what} slug already in use.`,
      status: 409,
    });
  }
  if (err instanceof StormError) return err;
  throw err as Error;
}
