'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  inStockProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    inStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch products
      const productsRes = await fetch('/api/products');
      const products = await productsRes.json();
      
      // Fetch orders (we'll create this API)
      const ordersRes = await fetch('/api/admin/orders');
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      
      const totalProducts = products.length;
      const inStockProducts = products.filter((p: any) => p.inStock).length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        inStockProducts,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: `${stats.inStockProducts} in stock`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      description: 'All time orders',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Total Revenue',
      value: `৳${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total sales',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'In Stock',
      value: stats.inStockProducts,
      icon: TrendingUp,
      description: 'Available products',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your grocery store management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:bg-muted transition">
                <CardContent className="p-6">
                  <Package className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Add New Product</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new product listing
                  </p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted transition">
                <CardContent className="p-6">
                  <ShoppingBag className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">View Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage customer orders
                  </p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted transition">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View sales analytics
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


