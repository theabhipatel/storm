"use client";

import { useProductRecsQuery } from "./recs.api";
import { RecsCarousel } from "./RecsCarousel";

export function ProductRecsWidget(props: { productId: string; title?: string }) {
  const { data, isLoading } = useProductRecsQuery(props.productId);
  return (
    <RecsCarousel
      title={props.title ?? "You might also like"}
      items={data?.items ?? []}
      loading={isLoading}
    />
  );
}
