export default function ProductDetailSkeleton() {
  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back button skeleton */}
        <div className="bg-muted mb-8 h-5 w-32 animate-pulse rounded" />

        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3">
          {/* Product Image Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-muted border-border aspect-square animate-pulse rounded-xl border shadow-sm" />
          </div>

          {/* Bidding Panel Skeleton */}
          <div className="space-y-6">
            {/* Title Section */}
            <div className="border-border space-y-3 border-b pb-6">
              <div className="space-y-2">
                <div className="bg-muted h-8 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
              </div>
              <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
            </div>

            {/* Current Bid Section */}
            <div className="space-y-2">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-10 w-2/3 animate-pulse rounded" />
              <div className="bg-muted h-4 w-40 animate-pulse rounded" />
            </div>

            {/* Item Info Grid */}
            <div className="border-border space-y-3 border-y py-4">
              <div className="flex justify-between">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-28 animate-pulse rounded" />
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
              <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
            </div>

            {/* Bid History Skeleton */}
            <div className="border-border space-y-4 border-t pt-6">
              <div className="bg-muted h-7 w-24 animate-pulse rounded" />
              <div className="space-y-2">
                <div className="bg-muted border-border h-16 animate-pulse rounded-lg border" />
              </div>
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="bg-muted h-8 w-32 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
