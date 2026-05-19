import type { OpenSearchClient } from "../infra/opensearch.js";

export interface ProductDoc {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  brandId: string;
  brandName: string;
  categoryIds: string[];
  categoryNames: string[];
  attributes: Record<string, string | number | boolean>;
  basePrice: number;
  currency: string;
  inStock: boolean;
  popularityScore: number;
  primaryImageUrl: string | null;
  status: "published";
  createdAt: string;
  updatedAt: string;
}

export function productDocRepo(os: OpenSearchClient, alias: string) {
  async function indexDoc(doc: ProductDoc): Promise<void> {
    await os.index({
      index: alias,
      id: doc.productId,
      body: doc as unknown as Record<string, unknown>,
      refresh: false,
    });
  }

  async function getDoc(productId: string): Promise<ProductDoc | null> {
    try {
      const res = await os.get<{ _source: ProductDoc }>({ index: alias, id: productId });
      return (res.body._source ?? null) as ProductDoc | null;
    } catch (err: unknown) {
      const status = (err as { meta?: { statusCode?: number } }).meta?.statusCode;
      if (status === 404) return null;
      throw err;
    }
  }

  async function deleteDoc(productId: string): Promise<void> {
    try {
      await os.delete({ index: alias, id: productId, refresh: false });
    } catch (err: unknown) {
      const status = (err as { meta?: { statusCode?: number } }).meta?.statusCode;
      if (status !== 404) throw err;
    }
  }

  // Partial update — used when only brand or category names change.
  async function patchDoc(productId: string, patch: Partial<ProductDoc>): Promise<void> {
    try {
      await os.update({
        index: alias,
        id: productId,
        body: { doc: patch as unknown as Record<string, unknown> },
        refresh: false,
      });
    } catch (err: unknown) {
      const status = (err as { meta?: { statusCode?: number } }).meta?.statusCode;
      if (status === 404) return; // not yet indexed — ignore
      throw err;
    }
  }

  return { indexDoc, getDoc, deleteDoc, patchDoc };
}

export type ProductDocRepo = ReturnType<typeof productDocRepo>;
