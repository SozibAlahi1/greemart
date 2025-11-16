'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/app/components/ProductCard';
import { useToast } from '@/app/components/Toast';
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

function CategoryPageContent() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);
  const [categoryName, setCategoryName] = useState<string>('');
  const [isValidCategory, setIsValidCategory] = useState<boolean | null>(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (params.category) {
      // Decode the category name from URL (handles spaces and special characters)
      const decodedCategory = decodeURIComponent(params.category as string);
      setCategoryName(decodedCategory);
      validateAndFetchCategory(decodedCategory);
    }
  }, [params.category]);

  const validateAndFetchCategory = async (category: string) => {
    try {
      // Fetch all categories to validate
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();
        const categoryNames = categories.map((c: { name: string }) => c.name);
        const isValid = categoryNames.includes(category);
        setIsValidCategory(isValid);
        if (isValid) {
          fetchProducts(category);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error validating category:', error);
      setIsValidCategory(false);
      setLoading(false);
    }
  };

  const fetchProducts = async (category: string) => {
    try {
      setLoading(true);
      // Fetch products filtered by category
      const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
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
          productId: product.id,
          quantity: 1,
          name: product.name,
          price: product.price,
          image: product.image
        }),
      });

      if (response.ok) {
        // Show success toast
        showToast(`${product.name} added to cart!`, 'success');
        
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

  if (loading || isValidCategory === null) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-xl">Loading products...</div>
        </div>
      </div>
    );
  }

  if (isValidCategory === false) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <p className="text-muted-foreground mb-6">
            The category "{categoryName}" does not exist.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
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
          Back to Home
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
        <p className="text-muted-foreground">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-xl">No products found in this category</p>
          <Button asChild className="mt-4">
            <Link href="/">Browse All Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {products.slice(0, displayCount).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          {products.length > displayCount && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setDisplayCount(prev => prev + 20)}
                variant="outline"
                size="lg"
                className="px-8"
              >
                Load More Products
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
}

export default function CategoryPage() {
  return <CategoryPageContent />;
}

