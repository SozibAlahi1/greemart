import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader className="px-2 sm:px-3 pt-2 sm:pt-3 pb-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-16" />
      </CardHeader>
      <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-7 sm:h-8 w-full sm:w-24" />
      </CardFooter>
    </Card>
  );
}

