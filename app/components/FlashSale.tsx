'use client';

import Link from 'next/link';
import { Clock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSessionId } from '@/lib/session';

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

interface FlashSaleProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function FlashSale({ products, onAddToCart }: FlashSaleProps) {
  // Get first 5 products for flash sale
  const flashSaleProducts = products.slice(0, 5);
  
  // Calculate sale price (20% off)
  const getSalePrice = (price: number) => (price * 0.8).toFixed(2);
  const getDiscount = (price: number) => ((price - price * 0.8) / price * 100).toFixed(0);

  const handleAddToCart = async (product: Product) => {
    // Use sale price (20% off)
    const salePrice = parseFloat(getSalePrice(product.price));
    
    try {
      // Optimistically call the parent's onAddToCart
      onAddToCart(product);
      
      // Dispatch event to refresh Header cart
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Add to cart in background with sale price
      const sessionId = getSessionId();
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          name: product.name,
          price: salePrice,
          image: product.image
        }),
      });

      if (!response.ok) {
        console.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="w-full mb-0">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg">
            <Clock className="h-5 w-5 animate-pulse" />
            <span className="font-bold text-lg">Flash Sale</span>
          </div>
          <Badge variant="destructive" className="text-sm">
            Limited Time Offer
          </Badge>
        </div>
        <p className="text-muted-foreground">Hurry up! Special discounts on selected items</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 w-full">
        {flashSaleProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
            <Badge 
              className="absolute top-1 right-1 z-10 bg-red-500 text-white text-[10px] px-1 py-0.5"
            >
              {getDiscount(product.price)}% OFF
            </Badge>
            <Link href={`/products/${product.id}`}>
              <div className="aspect-square bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition relative overflow-hidden">
                {product.image.startsWith('/') || product.image.startsWith('http') ? (
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
                <h3 className="font-semibold text-xs sm:text-sm hover:text-primary transition cursor-pointer line-clamp-2 leading-tight">
                  {product.name}
                </h3>
              </Link>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 py-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0.5 sm:gap-1.5">
                <span className="text-base sm:text-lg lg:text-xl font-bold text-primary">
                  ৳{getSalePrice(product.price)}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                  ৳{product.price.toFixed(2)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
              <Button
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                className="w-full text-[10px] sm:text-xs h-7 sm:h-8"
                size="sm"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

