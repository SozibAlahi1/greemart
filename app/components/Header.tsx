'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X, 
  Phone, 
  Truck,
  Home,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export default function Header() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to generate category URL
  const getCategoryUrl = (category: string) => {
    return `/categories/${encodeURIComponent(category)}`;
  };

  useEffect(() => {
    fetchCart();
    
    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'x-session-id': 'default'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      const data = await response.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': 'default'
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': 'default'
        }
      });
      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="bg-background border-b sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-2">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  <span>1-800-FRESH</span>
                </span>
                <span className="hidden md:flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  <span>Free delivery on orders over ৳50</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/about" className="hover:text-primary-foreground/80 transition">About Us</Link>
                <Link href="#" className="hover:text-primary-foreground/80 transition">Contact</Link>
                <Link href="#" className="hover:text-primary-foreground/80 transition">Help</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-3xl group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground group-hover:text-primary transition">
                  Fresh Groceries
                </div>
                <div className="text-xs text-muted-foreground">Your Fresh Market</div>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-32 h-12 rounded-full border-2"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
              {/* Account Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex flex-col h-auto py-2 gap-1"
                asChild
              >
                <Link href="#">
                  <User className="h-5 w-5" />
                  <span className="text-xs">Account</span>
                </Link>
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Cart Icon */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-auto py-2 gap-1 flex-col">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Cart</span>
                    {itemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-96 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>
                      {cart.length === 0 ? 'Your cart is empty' : `${itemCount} item(s) in your cart`}
                    </SheetDescription>
                  </SheetHeader>

                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg mb-4">Your cart is empty</p>
                      <Button asChild onClick={() => setIsCartOpen(false)}>
                        <Link href="/">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {cart.map((item) => {
                          const isImageUrl = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));
                          return (
                            <div key={item.productId} className="flex gap-4 p-4 border rounded-lg">
                              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-muted rounded overflow-hidden">
                                {isImageUrl ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-4xl">{item.image}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                                <p className="text-primary font-semibold text-sm">৳{item.price.toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  disabled={isLoading}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  disabled={isLoading}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => removeItem(item.productId)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total:</span>
                          <span className="text-primary">৳{total.toFixed(2)}</span>
                        </div>
                        <Button className="w-full" size="lg" asChild onClick={() => setIsCartOpen(false)}>
                          <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild onClick={() => setIsCartOpen(false)}>
                          <Link href="/">Continue Shopping</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-12 pr-24 h-12 rounded-full border-2"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-6 pb-4 border-t border-border pt-4">
            <Link href="/" className="text-foreground hover:text-primary font-medium transition flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href={getCategoryUrl('Fruits & Vegetables')} className="text-foreground hover:text-primary font-medium transition">
              Fruits & Vegetables
            </Link>
            <Link href={getCategoryUrl('Dairy & Eggs')} className="text-foreground hover:text-primary font-medium transition">
              Dairy & Eggs
            </Link>
            <Link href={getCategoryUrl('Meat & Seafood')} className="text-foreground hover:text-primary font-medium transition">
              Meat & Seafood
            </Link>
            <Link href={getCategoryUrl('Bakery')} className="text-foreground hover:text-primary font-medium transition">
              Bakery
            </Link>
            <Link href={getCategoryUrl('Beverages')} className="text-foreground hover:text-primary font-medium transition">
              Beverages
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary font-medium transition">
              About
            </Link>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden pb-4 border-t border-border pt-4 space-y-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Home
              </Link>
              <Link
                href={getCategoryUrl('Fruits & Vegetables')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Fruits & Vegetables
              </Link>
              <Link
                href={getCategoryUrl('Dairy & Eggs')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Dairy & Eggs
              </Link>
              <Link
                href={getCategoryUrl('Meat & Seafood')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Meat & Seafood
              </Link>
              <Link
                href={getCategoryUrl('Bakery')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Bakery
              </Link>
              <Link
                href={getCategoryUrl('Beverages')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Beverages
              </Link>
              <Link
                href={getCategoryUrl('Snacks')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Snacks
              </Link>
              <Link
                href={getCategoryUrl('Frozen Foods')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Frozen Foods
              </Link>
              <Link
                href={getCategoryUrl('Pantry Staples')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                Pantry Staples
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-foreground hover:text-primary font-medium transition"
              >
                About
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
