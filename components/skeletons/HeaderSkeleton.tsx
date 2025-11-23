import { Skeleton } from '@/components/ui/skeleton';

export default function HeaderSkeleton() {
  return (
    <header className="bg-background border-b sticky top-0 z-50">
      {/* Top Bar Skeleton */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32 bg-primary-foreground/20" />
              <Skeleton className="h-4 w-48 bg-primary-foreground/20 hidden md:block" />
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Skeleton className="h-4 w-16 bg-primary-foreground/20" />
              <Skeleton className="h-4 w-16 bg-primary-foreground/20" />
              <Skeleton className="h-4 w-16 bg-primary-foreground/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Skeleton */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between py-4">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-8 w-32" />
          </div>

          {/* Search Bar Skeleton - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>

          {/* Right Side Icons Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full hidden md:block" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Navigation Menu Skeleton */}
      <div className="border-t">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-6 py-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </header>
  );
}

