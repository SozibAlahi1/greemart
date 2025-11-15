'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isImageUrl = product.image.startsWith('/') || product.image.startsWith('http');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition overflow-hidden">
          {isImageUrl ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl sm:text-4xl lg:text-5xl">{product.image}</span>
          )}
        </div>
      </Link>
      <CardHeader className="px-2 sm:px-3 pt-2 sm:pt-3 pb-0">
        <Link href={`/products/${product.id}`}>
          <CardTitle className="hover:text-primary transition cursor-pointer line-clamp-2 text-xs sm:text-sm leading-tight">
            {product.name}
          </CardTitle>
        </Link>
        <div className="flex items-center gap-0.5 mt-1">
          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">{product.rating}</span>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
        <span className="text-base sm:text-lg lg:text-xl font-bold text-primary">৳{product.price.toFixed(2)}</span>
        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          size="sm"
          className="w-full sm:w-auto text-[10px] sm:text-xs h-7 sm:h-8"
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
