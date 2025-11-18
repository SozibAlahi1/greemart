import ProductCardSkeleton from './ProductCardSkeleton';

interface ProductListSkeletonProps {
  count?: number;
}

export default function ProductListSkeleton({ 
  count = 10
}: ProductListSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

