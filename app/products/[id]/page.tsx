'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewSection from '@/app/components/ReviewSection';
import ProductCard from '@/app/components/ProductCard';
import { useToast } from '@/app/components/Toast';
import { getSessionId } from '@/lib/session';

interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (params.id) {
      fetchProduct(String(params.id));
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        // Fetch related products from the same category
        fetchRelatedProducts(data.category, id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, currentProductId: string) => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const allProducts: Product[] = await response.json();
        // Filter products from same category, excluding current product, limit to 5
        const related = allProducts
          .filter(p => p.category === category && p.id !== currentProductId)
          .slice(0, 5);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const addToCart = async (productToAdd: Product, qty: number = 1) => {
    try {
      // Add to cart first
      const sessionId = getSessionId();
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          productId: productToAdd.id,
          quantity: qty,
          name: productToAdd.name,
          price: productToAdd.price,
          image: productToAdd.image
        }),
      });

      if (response.ok) {
        // Show success toast
        showToast(`${qty} x ${productToAdd.name} added to cart!`, 'success');
        
        // Dispatch event to refresh Header cart AFTER successful API call
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        showToast('Failed to add item to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center max-w-7xl">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to shop
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {ToastComponent}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button asChild variant="ghost" className="mb-4">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to shop
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <Card>
          <CardContent className="p-8">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {product.image.startsWith('/') || product.image.startsWith('http') ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">{product.image}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardContent className="p-8">
            <div className="mb-4">
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg">{product.rating}</span>
              <span className="text-muted-foreground">(4.5)</span>
            </div>

            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              {product.description}
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">
                ৳{product.price.toFixed(2)}
              </span>
            </div>

            {product.inStock ? (
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <label className="font-semibold">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            ) : (
              <Button
                disabled
                className="w-full"
                size="lg"
              >
                Out of Stock
              </Button>
            )}

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Product Details:</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Fresh and organic</li>
                <li>• Fast delivery available</li>
                <li>• Money-back guarantee</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Full Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                {product.fullDescription ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                    {product.fullDescription}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No detailed description available for this product.</p>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <ReviewSection productId={product.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAddToCart={(p) => addToCart(p, 1)}
              />
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
