"use client";

import { useState } from "react";

import { fallbackImageUrl } from "../../lib/productImage";

interface ProductImageProps {
  src?: string | null | undefined;
  alt: string;
  // Stable key for the generated fallback photo (defaults to alt). Pass the
  // product slug so the same product shows the same photo across views.
  seed?: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
}

export function ProductImage({
  src,
  alt,
  seed,
  className,
  sizes,
  loading = "lazy",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? fallbackImageUrl(seed ?? alt) : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      sizes={sizes}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
