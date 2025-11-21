'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Menu, 
  X,
  LogOut,
  Home,
  Tag,
  Bell,
  Settings,
  User,
  UserCircle,
  List,
  Shield,
  Puzzle,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/app/components/theme-toggle';
import PageSkeleton from '@/components/skeletons/PageSkeleton';
import { useSettings } from '@/lib/useSettings';
import { useModules } from '@/lib/hooks/useModules';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useSettings();
  const { isModuleEnabled } = useModules();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      return;
    }

    try {
      const response = await fetch('/api/admin/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Fetch pending orders count and notifications
  const fetchPendingCount = async () => {
    try {
      const response = await fetch('/api/admin/orders/pending-count');
      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const since = lastChecked.toISOString();
      const response = await fetch(`/api/admin/orders/notifications?limit=10&since=${since}`);
      if (response.ok) {
        const data = await response.json();
        if (data.notifications && data.notifications.length > 0) {
          setNotifications((prev) => {
            // Merge new notifications, avoiding duplicates
            const existingIds = new Set(prev.map((n: any) => n.orderId));
            const newNotifications = data.notifications.filter(
              (n: any) => !existingIds.has(n.orderId)
            );
            return [...newNotifications, ...prev].slice(0, 10);
          });
          // Show browser notification if not focused
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`New Order: ${data.notifications[0].orderId}`, {
              body: `${data.notifications[0].customerName} - ${data.notifications[0].phone}`,
              icon: '/favicon.ico',
            });
          }
        }
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll for pending orders and notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchPendingCount();
    fetchNotifications();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchPendingCount();
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
    router.refresh();
  };

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (loading || isAuthenticated === false) {
    return <PageSkeleton />;
  }

  // Only render layout if authenticated
  if (!isAuthenticated) {
    return null;
  }

  const allMenuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      moduleId: 'dashboard',
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: Package,
      moduleId: 'products',
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: Tag,
      moduleId: 'products', // Categories are part of products module
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      moduleId: 'orders',
    },
    {
      title: 'Menus',
      href: '/admin/menus',
      icon: List,
      moduleId: 'menus',
    },
    {
      title: 'Fraud Check',
      href: '/admin/fraud-check',
      icon: Shield,
      moduleId: 'fraud-check',
    },
    {
      title: 'WhatsApp Marketing',
      href: '/admin/whatsapp-marketing',
      icon: MessageSquare,
      moduleId: 'whatsapp-marketing',
    },
    {
      title: 'Modules',
      href: '/admin/modules',
      icon: Puzzle,
      moduleId: 'core', // Always visible
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      moduleId: 'core', // Always visible
    },
  ];

  // Filter menu items based on module status
  const menuItems = allMenuItems.filter(item => {
    if (item.moduleId === 'core') return true;
    return isModuleEnabled(item.moduleId);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Store
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {/* Notification Icon with Dropdown */}
              <DropdownMenu open={notificationMenuOpen} onOpenChange={setNotificationMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {pendingCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    <div className="flex items-center justify-between">
                      <span>Notifications</span>
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.orderId}
                          asChild
                          className="flex flex-col items-start p-3 cursor-pointer"
                        >
                          <Link
                            href="/admin/orders"
                            onClick={() => setNotificationMenuOpen(false)}
                            className="w-full"
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-semibold text-sm">
                                Order #{notification.orderId}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {notification.customerName} • {notification.phone}
                            </div>
                            <div className="text-xs font-medium mt-1">
                              Total: {settings.currencySymbol}{notification.total?.toFixed(2) || '0.00'}
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/orders"
                      onClick={() => setNotificationMenuOpen(false)}
                      className="text-center w-full"
                    >
                      View All Orders
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Orders Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                asChild
                title="Orders"
              >
                <Link href="/admin/orders">
                  <ShoppingBag className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              <ThemeToggle />
              
              {/* Profile Dropdown */}
              <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-muted"
                    onMouseEnter={() => setProfileMenuOpen(true)}
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    <UserCircle className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56"
                  onMouseEnter={() => setProfileMenuOpen(true)}
                  onMouseLeave={() => setProfileMenuOpen(false)}
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}


