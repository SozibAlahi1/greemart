'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './theme-toggle';
import { getSessionId } from '@/lib/session';
import { useSettings } from '@/lib/useSettings';
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

interface MenuItem {
  _id: string;
  label: string;
  url: string;
  type: 'link' | 'category' | 'page';
  target?: string;
  icon?: string;
  order: number;
  parentId?: string | null;
  children?: MenuItem[];
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useSettings();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [mobileMenuItems, setMobileMenuItems] = useState<MenuItem[]>([]);
  const [expandedMenuItems, setExpandedMenuItems] = useState<Set<string>>(new Set());

  // Helper function to generate category URL
  const getCategoryUrl = (category: string) => {
    return `/categories/${encodeURIComponent(category)}`;
  };

  // Helper function to build menu URL
  const getMenuUrl = (item: MenuItem): string => {
    if (item.type === 'category') {
      return getCategoryUrl(item.url);
    }
    return item.url;
  };

  // Build menu tree from flat items
  const buildMenuTree = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create map of all items
    items.forEach(item => {
      itemMap.set(item._id, { ...item, children: [] });
    });

    // Second pass: build tree
    items.forEach(item => {
      const menuItem = itemMap.get(item._id)!;
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(menuItem);
        } else {
          rootItems.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    // Sort by order
    const sortItems = (items: MenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children) {
          sortItems(item.children);
        }
      });
    };

    sortItems(rootItems);
    return rootItems;
  };

  useEffect(() => {
    fetchCart();
    fetchMenus();
    
    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const fetchMenus = async () => {
    try {
      // Fetch header menu
      const headerResponse = await fetch('/api/menus?location=header');
      if (headerResponse.ok) {
        const headerMenus = await headerResponse.json();
        if (headerMenus.length > 0) {
          const headerMenu = headerMenus[0];
          setMenuItems(buildMenuTree(headerMenu.items));
        }
      }

      // Fetch mobile menu (or use header menu if no mobile menu exists)
      const mobileResponse = await fetch('/api/menus?location=mobile');
      if (mobileResponse.ok) {
        const mobileMenus = await mobileResponse.json();
        if (mobileMenus.length > 0) {
          const mobileMenu = mobileMenus[0];
          setMobileMenuItems(buildMenuTree(mobileMenu.items));
        } else {
          // Fallback to header menu if no mobile menu exists
          const headerResponse = await fetch('/api/menus?location=header');
          if (headerResponse.ok) {
            const headerMenus = await headerResponse.json();
            if (headerMenus.length > 0) {
              const headerMenu = headerMenus[0];
              setMobileMenuItems(buildMenuTree(headerMenu.items));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/cart', {
        headers: {
          'x-session-id': sessionId
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
      const sessionId = getSessionId();
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
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
      const sessionId = getSessionId();
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId
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
                  <span>{settings.contactPhone}</span>
                </span>
                <span className="hidden md:flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  <span>Free delivery on orders over {settings.currencySymbol}{settings.freeDeliveryThreshold}</span>
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
              {settings.siteLogo ? (
                <img 
                  src={settings.siteLogo} 
                  alt={settings.siteName} 
                  className="h-10 w-auto group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="text-3xl group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition">
                {settings.siteName}
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
                className="hidden md:flex"
                asChild
              >
                <Link href="#">
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Cart Icon */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
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
                                <p className="text-primary font-semibold text-sm">{settings.currencySymbol}{item.price.toFixed(2)}</p>
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
                          <span className="text-primary">{settings.currencySymbol}{total.toFixed(2)}</span>
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
            {menuItems.length > 0 ? (
              menuItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenuItems.has(item._id);
                
                return (
                  <div key={item._id} className="relative group">
                    <Link
                      href={getMenuUrl(item)}
                      target={item.target || '_self'}
                      className="text-foreground hover:text-primary font-medium transition flex items-center gap-1"
                    >
                      {item.label}
                      {hasChildren && <ChevronDown className="h-4 w-4" />}
                    </Link>
                    {hasChildren && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <div className="py-2">
                          {item.children?.map((child) => (
                            <Link
                              key={child._id}
                              href={getMenuUrl(child)}
                              target={child.target || '_self'}
                              className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback to default menu if no menu is configured
              <>
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
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden pb-4 border-t border-border pt-4 space-y-2">
              {mobileMenuItems.length > 0 ? (
                mobileMenuItems.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedMenuItems.has(item._id);
                  
                  return (
                    <div key={item._id}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={getMenuUrl(item)}
                          target={item.target || '_self'}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-foreground hover:text-primary font-medium transition flex-1"
                        >
                          {item.label}
                        </Link>
                        {hasChildren && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const newExpanded = new Set(expandedMenuItems);
                              if (isExpanded) {
                                newExpanded.delete(item._id);
                              } else {
                                newExpanded.add(item._id);
                              }
                              setExpandedMenuItems(newExpanded);
                            }}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                      {hasChildren && isExpanded && (
                        <div className="pl-4 space-y-1">
                          {item.children?.map((child) => (
                            <Link
                              key={child._id}
                              href={getMenuUrl(child)}
                              target={child.target || '_self'}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-2 text-sm text-muted-foreground hover:text-primary font-medium transition"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // Fallback to default menu if no menu is configured
                <>
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
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-foreground hover:text-primary font-medium transition"
                  >
                    About
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
