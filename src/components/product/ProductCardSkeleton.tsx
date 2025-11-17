export default function ProductCardSkeleton() {
  return (
    <div className="group flex h-full animate-pulse cursor-default flex-col">
      {/* Image Container Skeleton */}
      <div className="bg-muted border-border relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
        <div className="h-full w-full bg-gray-300" />
      </div>

      {/* Info Skeleton */}
      <div className="flex flex-1 flex-col space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="bg-muted h-5 w-3/4 rounded" />
          <div className="bg-muted h-5 w-1/2 rounded" />
        </div>

        {/* Price & Time Skeleton */}
        <div className="space-y-2">
          <div className="bg-muted h-8 w-2/3 rounded" />
          <div className="bg-muted h-4 w-1/3 rounded" />
        </div>
      </div>
    </div>
  );
}
