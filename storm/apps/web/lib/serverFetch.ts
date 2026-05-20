// Server-side fetch helpers — called from Next.js server components only.
// They hit web-bff directly (server-to-server), not Kong, so they don't need
// auth headers or cookie handling.
import type {
  AutocompleteResponse,
  FacetsResponse,
  MediaAssetDto,
  ProductDetail,
  SearchResponse,
} from "@storm/contracts";

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
  stock: { sku: string; available: number; inStock: boolean };
}

export interface HomeCategoryCard {
  id: string;
  name: string;
  slug: string;
}
export interface HomeBrandCard {
  id: string;
  name: string;
  slug: string;
}

export interface HomeResponse {
  topCategories: HomeCategoryCard[];
  topSellers: SearchResponse["data"];
  featuredBrands: HomeBrandCard[];
}

export interface CategoryListingResponse {
  category: { id: string; name: string; slug: string };
  breadcrumb: { id: string; name: string; slug: string }[];
  subcategories: { id: string; name: string; slug: string }[];
  results: SearchResponse;
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
  if (!res.ok) throw new Error(`web-bff returned ${res.status} for slug=${slug}`);
  return (await res.json()) as ProductDetailResponse;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: CategoryNode[];
}

export async function fetchCategoryTree(
  revalidateSeconds = 300,
): Promise<CategoryNode[]> {
  const res = await fetch(`${WEB_BFF_URL}/api/categories`, {
    next: { revalidate: revalidateSeconds, tags: ["categories"] },
  });
  if (!res.ok) throw new Error(`web-bff /categories returned ${res.status}`);
  const body = (await res.json()) as { items: CategoryNode[] };
  return body.items;
}

export async function fetchHome(revalidateSeconds = 30): Promise<HomeResponse> {
  const res = await fetch(`${WEB_BFF_URL}/api/home`, {
    next: { revalidate: revalidateSeconds, tags: ["home"] },
  });
  if (!res.ok) throw new Error(`web-bff /home returned ${res.status}`);
  return (await res.json()) as HomeResponse;
}

export async function fetchCategoryListing(
  slug: string,
  query: Record<string, string | string[] | undefined>,
  revalidateSeconds = 60,
): Promise<CategoryListingResponse | null> {
  const qs = toQs(query);
  const url = `${WEB_BFF_URL}/api/c/${encodeURIComponent(slug)}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds, tags: [`category:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`web-bff /c/${slug} returned ${res.status}`);
  return (await res.json()) as CategoryListingResponse;
}

export async function fetchSearch(
  query: Record<string, string | string[] | undefined>,
): Promise<SearchResponse> {
  const qs = toQs(query);
  const res = await fetch(`${WEB_BFF_URL}/api/search${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`web-bff /search returned ${res.status}`);
  return (await res.json()) as SearchResponse;
}

export async function fetchFacets(
  query: Record<string, string | string[] | undefined>,
): Promise<FacetsResponse> {
  const qs = toQs(query);
  const res = await fetch(`${WEB_BFF_URL}/api/facets${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`web-bff /facets returned ${res.status}`);
  return (await res.json()) as FacetsResponse;
}

export async function fetchAutocomplete(q: string): Promise<AutocompleteResponse> {
  const res = await fetch(`${WEB_BFF_URL}/api/autocomplete?q=${encodeURIComponent(q)}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`web-bff /autocomplete returned ${res.status}`);
  return (await res.json()) as AutocompleteResponse;
}

function toQs(query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length > 0) params.set(k, v.join(","));
    } else {
      params.set(k, v);
    }
  }
  return params.toString();
}
