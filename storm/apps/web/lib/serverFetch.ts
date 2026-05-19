// Server-side fetch helpers — called from Next.js server components only.
// They hit web-bff directly (server-to-server), not Kong, so they don't need
// auth headers or cookie handling.
import type { MediaAssetDto, ProductDetail } from "@storm/contracts";

export interface BreadcrumbItem {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetailResponse extends ProductDetail {
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  breadcrumb: BreadcrumbItem[];
  mediaAssets: MediaAssetDto[];
}

const WEB_BFF_URL = process.env["WEB_BFF_BASE_URL"] ?? "http://localhost:3000";

export async function fetchProductBySlug(
  slug: string,
  revalidateSeconds = 60,
): Promise<ProductDetailResponse | null> {
  const res = await fetch(`${WEB_BFF_URL}/api/p/${encodeURIComponent(slug)}`, {
    next: { revalidate: revalidateSeconds, tags: [`product:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`web-bff returned ${res.status} for slug=${slug}`);
  }
  return (await res.json()) as ProductDetailResponse;
}
