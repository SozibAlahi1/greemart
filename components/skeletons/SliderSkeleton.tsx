import { Skeleton } from '@/components/ui/skeleton';

export default function SliderSkeleton() {
  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="overflow-hidden rounded-lg">
          <Skeleton className="h-[300px] md:h-[400px] lg:h-[450px] w-full" />
        </div>
      </div>

      {/* Dot Indicators Skeleton */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        <Skeleton className="h-2 w-8 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
    </div>
  );
}

