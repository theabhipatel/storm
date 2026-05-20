"use client";

import { useUserRecsQuery } from "./recs.api";
import { RecsCarousel } from "./RecsCarousel";

export function PopularRecsWidget() {
  const { data, isLoading } = useUserRecsQuery();
  return (
    <RecsCarousel
      title="Popular right now"
      items={data?.items ?? []}
      loading={isLoading}
    />
  );
}
