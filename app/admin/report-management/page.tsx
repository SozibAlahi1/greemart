'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, ShoppingBag, Package, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/app/components/Toast';
import { useSettings } from '@/lib/useSettings';
import { ModuleGuard } from '@/components/modules/ModuleGuard';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

interface ReportData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    totalProducts: number;
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
  orders: any[];
  products: any[];
}

type ReportType = 'sales' | 'orders' | 'products' | 'revenue';

export default function ReportManagement() {
  const { showToast, ToastComponent } = useToast();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 29);
    setEndDate(defaultEndDate);
    setStartDate(defaultStartDate.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [reportType, dateRange, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const days = dateRange === 'custom' 
        ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : parseInt(dateRange);

      const [analyticsRes, ordersRes, productsRes] = await Promise.all([
        fetch(`/api/admin/orders/analytics?days=${days}`),
        fetch('/api/admin/orders'),
        fetch('/api/products'),
      ]);

      const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const products = productsRes.ok ? await productsRes.json() : [];

      // Filter orders by date range if custom
      let filteredOrders = orders;
      if (dateRange === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        filteredOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= start && orderDate <= end;
        });
      } else if (dateRange !== 'custom') {
        const start = new Date();
        start.setDate(start.getDate() - (parseInt(dateRange) - 1));
        start.setHours(0, 0, 0, 0);
        
        filteredOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= start;
        });
      }

      setReportData({
        summary: analytics?.summary || {
          totalOrders: filteredOrders.length,
          totalRevenue: filteredOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          avgOrderValue: filteredOrders.length > 0 
            ? filteredOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0) / filteredOrders.length 
            : 0,
          totalProducts: products.length,
        },
        dailyOrders: analytics?.dailyOrders || [],
        statusCounts: analytics?.statusCounts || {},
        topProducts: analytics?.topProducts || [],
        orders: filteredOrders,
        products: products,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      showToast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as '7' | '30' | '90' | 'custom');
    if (value !== 'custom') {
      const today = new Date();
      const days = parseInt(value);
      const start = new Date(today);
      start.setDate(today.getDate() - (days - 1));
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  };

  const formatCurrency = (value: number) =>
    `${settings.currencySymbol || '৳'}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'sales':
        csvContent = 'Date,Orders,Revenue\n';
        reportData.dailyOrders.forEach((day) => {
          csvContent += `${day.date},${day.orders},${day.revenue}\n`;
        });
        filename = `sales-report-${startDate}-to-${endDate}.csv`;
        break;
      case 'orders':
        csvContent = 'Order ID,Date,Customer,Status,Total\n';
        reportData.orders.forEach((order: any) => {
          const orderId = order._id || order.id;
          const orderIdStr = orderId ? String(orderId) : 'N/A';
          const orderDate = order.orderDate 
            ? new Date(order.orderDate).toLocaleDateString()
            : 'N/A';
          csvContent += `${orderIdStr},${orderDate},${order.customerName || 'N/A'},${order.status || 'pending'},${order.total || 0}\n`;
        });
        filename = `orders-report-${startDate}-to-${endDate}.csv`;
        break;
      case 'products':
        csvContent = 'Product Name,Quantity Sold,Revenue\n';
        reportData.topProducts.forEach((product) => {
          csvContent += `${product.name},${product.quantity},${product.revenue}\n`;
        });
        filename = `products-report-${startDate}-to-${endDate}.csv`;
        break;
      case 'revenue':
        csvContent = 'Date,Revenue,Orders,Avg Order Value\n';
        reportData.dailyOrders.forEach((day) => {
          const avgValue = day.orders > 0 ? day.revenue / day.orders : 0;
          csvContent += `${day.date},${day.revenue},${day.orders},${avgValue}\n`;
        });
        filename = `revenue-report-${startDate}-to-${endDate}.csv`;
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report exported successfully', 'success');
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };

  if (loading) {
    return (
      <ModuleGuard moduleId="report-management">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Report Management</h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports for your business
            </p>
          </div>
          <TableSkeleton />
        </div>
      </ModuleGuard>
    );
  }

  return (
    <ModuleGuard moduleId="report-management">
      <div className="space-y-6">
        {ToastComponent}
        <div>
          <h1 className="text-3xl font-bold mb-2">Report Management</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports for your business
          </p>
        </div>

        {/* Report Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Select report type and date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger id="report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="orders">Orders Report</SelectItem>
                    <SelectItem value="products">Products Report</SelectItem>
                    <SelectItem value="revenue">Revenue Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger id="date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {dateRange === 'custom' && (
                <>
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-4">
              <Button onClick={exportToCSV} disabled={!reportData}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.summary.avgOrderValue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.totalProducts}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Content */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === 'sales' && 'Sales Report'}
                {reportType === 'orders' && 'Orders Report'}
                {reportType === 'products' && 'Products Report'}
                {reportType === 'revenue' && 'Revenue Report'}
              </CardTitle>
              <CardDescription>
                {dateRange === 'custom' 
                  ? `${startDate} to ${endDate}`
                  : `Last ${dateRange} days`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportType === 'sales' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.dailyOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No data available for the selected period
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.dailyOrders.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                            <TableCell>{day.orders}</TableCell>
                            <TableCell>{formatCurrency(day.revenue)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {reportType === 'orders' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No orders found for the selected period
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.orders.map((order: any) => {
                          const orderId = order._id || order.id;
                          const orderIdStr = orderId ? String(orderId).slice(-8) : 'N/A';
                          return (
                            <TableRow key={orderId || Math.random()}>
                              <TableCell className="font-mono text-sm">
                                {orderIdStr}
                              </TableCell>
                              <TableCell>
                                {order.orderDate 
                                  ? new Date(order.orderDate).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>{order.customerName || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {statusLabels[order.status] || order.status || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(order.total || 0)}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {reportType === 'products' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.topProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No product sales data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.topProducts.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{formatCurrency(product.revenue)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {reportType === 'revenue' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Avg Order Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.dailyOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No data available for the selected period
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.dailyOrders.map((day) => {
                          const avgValue = day.orders > 0 ? day.revenue / day.orders : 0;
                          return (
                            <TableRow key={day.date}>
                              <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                              <TableCell>{formatCurrency(day.revenue)}</TableCell>
                              <TableCell>{day.orders}</TableCell>
                              <TableCell>{formatCurrency(avgValue)}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Breakdown */}
        {reportData && reportData.statusCounts && Object.keys(reportData.statusCounts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(reportData.statusCounts).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className="text-2xl font-bold">{count as number}</div>
                    <div className="text-sm text-muted-foreground">
                      {statusLabels[status] || status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleGuard>
  );
}

