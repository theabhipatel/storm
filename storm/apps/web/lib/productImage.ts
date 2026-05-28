// Deterministic free placeholder photo per product, served by picsum.photos.
// Used when a product has no real media yet (seed data ships a 1x1 placeholder).
export function fallbackImageUrl(seed: string | null | undefined, size = 600): string {
  const slug = (seed ?? "").trim().toLowerCase().replace(/\s+/g, "-") || "storm";
  return `https://picsum.photos/seed/storm-${encodeURIComponent(slug)}/${size}/${size}`;
}

// Seed data links every product to a shared 1x1 "Storm placeholder" asset.
// Treat those as "no real image" so we fall back to a generated photo.
export function isPlaceholderAsset(asset: {
  altText?: string | null;
  width?: number | null;
}): boolean {
  return asset.altText === "Storm placeholder" || (asset.width ?? 0) <= 1;
}
