'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Activity,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { useSettings } from '@/lib/useSettings';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

type CustomTooltipProps = TooltipProps<ValueType, NameType> & {
  payload?: Array<{
    dataKey?: string;
    value?: number | string;
    name?: string;
    color?: string;
  }>;
  label?: string | number;
  currencySymbol?: string;
};

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  inStockProducts: number;
}

interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
  dailyOrders: {
    date: string;
    orders: number;
    revenue: number;
  }[];
  statusCounts: Record<string, number>;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const statusColors: Record<string, string> = {
  pending: 'text-amber-600',
  confirmed: 'text-blue-600',
  processing: 'text-indigo-600',
  shipped: 'text-cyan-600',
  delivered: 'text-emerald-600',
  cancelled: 'text-red-600',
  refunded: 'text-purple-600',
};

const statusBgColors: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-900/20',
  confirmed: 'bg-blue-100 dark:bg-blue-900/20',
  processing: 'bg-indigo-100 dark:bg-indigo-900/20',
  shipped: 'bg-cyan-100 dark:bg-cyan-900/20',
  delivered: 'bg-emerald-100 dark:bg-emerald-900/20',
  cancelled: 'bg-red-100 dark:bg-red-900/20',
  refunded: 'bg-purple-100 dark:bg-purple-900/20',
};

export default function AdminDashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    inStockProducts: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, analyticsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/orders/analytics?days=7'),
      ]);

      const products = productsRes.ok ? await productsRes.json() : [];
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;
      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      const totalProducts = products.length;
      const inStockProducts = products.filter((p: any) => p.inStock).length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum: number, order: any) => sum + (order.total || 0),
        0
      );

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

  const formatCurrency = (value: number, digits = 2) =>
    `${settings.currencySymbol || '৳'}${value.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;

  const recentDailyOrders = analytics ? analytics.dailyOrders.slice(-7) : [];
  const latestDay = recentDailyOrders[recentDailyOrders.length - 1];

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
      value: formatCurrency(stats.totalRevenue),
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

      {analytics && recentDailyOrders.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Today's Orders",
              value: latestDay?.orders ?? 0,
              helper: 'Orders recorded today',
            },
            {
              title: "Today's Revenue",
              value: formatCurrency(latestDay?.revenue ?? 0),
              helper: 'Gross sales today',
            },
            {
              title: 'Avg Order Value',
              value: formatCurrency(analytics.summary.avgOrderValue),
              helper: 'Across selected period',
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{item.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.helper}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analytics && (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Orders & Revenue (Last 7 days)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track order volume and revenue trends
                </p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="h-[360px]">
              {recentDailyOrders.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={recentDailyOrders.map((point) => ({
                      ...point,
                      label: new Date(point.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      }),
                    }))}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" stroke="currentColor" className="text-xs" />
                    <YAxis
                      yAxisId="left"
                      stroke="currentColor"
                      className="text-xs"
                      allowDecimals={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="currentColor"
                      className="text-xs"
                      tickFormatter={(value) =>
                        formatCurrency(typeof value === 'number' ? value : Number(value), 0)
                      }
                    />
                    <Tooltip content={<AnalyticsTooltip currencySymbol={settings.currencySymbol} />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#10b981"
                      fill="url(#ordersGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#6366f1"
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No analytics data available yet.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current distribution by status
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.statusCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            statusBgColors[status] || 'bg-muted'
                          }`}
                        >
                          <PieChart className={`h-5 w-5 ${statusColors[status] || 'text-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {statusLabels[status] || status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {((count / Math.max(analytics.summary.totalOrders, 1)) * 100).toFixed(1)}% of orders
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">{count}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <p className="text-sm text-muted-foreground">Best sellers by quantity</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No product data available.</p>
                ) : (
                  analytics.topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} sold · {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                        {product.quantity} pcs
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/admin/products">Manage products</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/orders">Review orders</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/settings">Site settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsTooltip({
  active,
  payload,
  label,
  currencySymbol = '৳',
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const orders = payload.find((item) => item.dataKey === 'orders');
  const revenue = payload.find((item) => item.dataKey === 'revenue');

  return (
    <div className="rounded-md border bg-background/90 p-3 text-sm shadow-lg">
      <p className="font-semibold">{label}</p>
      {orders && (
        <p className="mt-1 text-emerald-600">
          Orders:{' '}
          <span className="font-semibold">
            {typeof orders.value === 'number' ? orders.value : orders.value ?? 0}
          </span>
        </p>
      )}
      {revenue && (
        <p className="text-indigo-600">
          Revenue:{' '}
          <span className="font-semibold">
            {currencySymbol}
            {typeof revenue.value === 'number'
              ? revenue.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : revenue.value}
          </span>
        </p>
      )}
    </div>
  );
}


