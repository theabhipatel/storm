export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-surface-strong/70 ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 shadow-card">
      <SkeletonBox className="aspect-square w-full" />
      <SkeletonBox className="h-3 w-1/2" />
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-5 w-2/5" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading product"
      className="grid grid-cols-1 gap-8 lg:grid-cols-[520px_1fr]"
    >
      <div className="space-y-3">
        <SkeletonBox className="aspect-square w-full" />
        <div className="grid grid-cols-5 gap-2">
          <SkeletonBox className="aspect-square w-full" />
          <SkeletonBox className="aspect-square w-full" />
          <SkeletonBox className="aspect-square w-full" />
          <SkeletonBox className="aspect-square w-full" />
          <SkeletonBox className="aspect-square w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <SkeletonBox className="h-3 w-1/4" />
        <SkeletonBox className="h-7 w-3/4" />
        <SkeletonBox className="h-5 w-1/3" />
        <SkeletonBox className="h-8 w-1/2" />
        <SkeletonBox className="h-32 w-full" />
        <div className="flex gap-3">
          <SkeletonBox className="h-12 w-40" />
          <SkeletonBox className="h-12 w-40" />
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading cart"
      className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
    >
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-lg border border-border bg-surface p-4 shadow-card"
          >
            <SkeletonBox className="h-24 w-24 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-4 w-2/3" />
              <SkeletonBox className="h-3 w-1/3" />
              <SkeletonBox className="h-8 w-32" />
            </div>
            <SkeletonBox className="h-5 w-20" />
          </div>
        ))}
      </div>
      <div className="h-fit space-y-3 rounded-lg border border-border bg-surface p-5 shadow-card">
        <SkeletonBox className="h-5 w-1/2" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-10 w-full" />
      </div>
    </div>
  );
}

export function OrderListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading orders" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonBox className="h-3 w-1/2" />
          </div>
          <SkeletonBox className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading order" className="space-y-6">
      <SkeletonBox className="h-7 w-1/2" />
      <SkeletonBox className="h-24 w-full" />
      <SkeletonBox className="h-40 w-full" />
      <SkeletonBox className="h-24 w-full" />
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div role="status" aria-label="Loading account" className="space-y-4">
      <SkeletonBox className="h-7 w-1/3" />
      <SkeletonBox className="h-32 w-full" />
      <SkeletonBox className="h-32 w-full" />
    </div>
  );
}
