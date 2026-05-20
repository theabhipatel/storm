"use client";

import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
}

const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f1f5f9'/%3E%3Cpath d='M20 56 L36 38 L46 50 L60 32 L62 56 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='30' cy='28' r='6' fill='%23cbd5e1'/%3E%3C/svg%3E";

export function ProductImage({
  src,
  alt,
  className,
  sizes,
  loading = "lazy",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? PLACEHOLDER : src;
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
