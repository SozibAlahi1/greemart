'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import FlashSale from './FlashSale';
import { useToast } from './Toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}

function HomeContentInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    // Read URL params
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(query) ||
             p.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
    // Reset display count when filters change
    setDisplayCount(20);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterProducts();
  };

  const addToCart = async (product: Product) => {
    try {
      // Optimistically show success
      showToast(`${product.name} added to cart!`, 'success');
      
      // Dispatch event to refresh Header cart
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Add to cart in background
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': 'default'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          name: product.name,
          price: product.price,
          image: product.image
        }),
      });

      if (!response.ok) {
        showToast('Failed to add item to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <>
      {ToastComponent}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Flash Sale Section */}
        <FlashSale products={products} onAddToCart={addToCart} />

      {/* Products Grid */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          {searchQuery && ` - Search: "${searchQuery}"`}
        </h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-xl">No products found</p>
            <Button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {filteredProducts.slice(0, displayCount).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
            {filteredProducts.length > displayCount && (
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
    </div>
    </>
  );
}

export default function HomeContent() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <HomeContentInner />
    </Suspense>
  );
}

