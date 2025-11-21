'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Eye, Edit, Save, X, Truck, RefreshCw, Shield, ShieldAlert, Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import { useModules } from '@/lib/hooks/useModules';
import { useToast } from '@/app/components/Toast';

interface OrderItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface Order {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  orderDate: string;
  status?: string;
  // Steadfast Courier fields
  steadfastConsignmentId?: number;
  steadfastTrackingCode?: string;
  steadfastStatus?: string;
  steadfastSentAt?: string;
  // Fraud Check fields
  fraudChecked?: boolean;
  fraudCheckResult?: {
    success: boolean;
    totalOrders?: number;
    successfulOrders?: number;
    failedOrders?: number;
    successRatio?: number;
    fraudScore?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    status?: string;
    lastOrderDate?: string;
    courierData?: {
      [key: string]: {
        name: string;
        logo: string;
        total_parcel: number;
        success_parcel: number;
        cancelled_parcel: number;
        success_ratio: number;
      };
    };
    summary?: {
      total_parcel: number;
      success_parcel: number;
      cancelled_parcel: number;
      success_ratio: number;
    };
    checkedAt: string;
  };
  fraudCheckAt?: string;
}

export default function AdminOrders() {
  const { isModuleEnabled } = useModules();
  const { showToast, ToastComponent } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    status: '',
  });
  const [saving, setSaving] = useState(false);
  const [sendingToSteadfast, setSendingToSteadfast] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [checkingFraud, setCheckingFraud] = useState<string | null>(null);
  const [fraudCheckResult, setFraudCheckResult] = useState<{
    orderId: string;
    result: Order['fraudCheckResult'];
  } | null>(null);
  const [isFraudResultDialogOpen, setIsFraudResultDialogOpen] = useState(false);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  // Create order state
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [createOrderForm, setCreateOrderForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    status: 'pending',
    items: [] as Array<{ productId: string; name: string; price: number; image: string; quantity: number }>,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.phone.includes(query) ||
      (order.status || 'pending').toLowerCase().includes(query)
    );
  });

  // Debug: Log dialog state changes
  useEffect(() => {
    console.log('Dialog state changed:', { isDialogOpen, selectedOrder: selectedOrder?.orderId });
  }, [isDialogOpen, selectedOrder]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProductToOrder = (product: any) => {
    const existingItemIndex = createOrderForm.items.findIndex(
      (item) => item.productId === product.id
    );

    let updatedItems: typeof createOrderForm.items;
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      updatedItems = [...createOrderForm.items];
      updatedItems[existingItemIndex].quantity += 1;
    } else {
      // Add new product
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      };
      updatedItems = [...createOrderForm.items, newItem];
    }
    
    setIsProductSelectionOpen(false);
    calculateTotals(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = createOrderForm.items.filter((_, i) => i !== index);
    setCreateOrderForm({ ...createOrderForm, items: updatedItems });
    calculateTotals(updatedItems);
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updatedItems = [...createOrderForm.items];
    updatedItems[index].quantity = quantity;
    setCreateOrderForm({ ...createOrderForm, items: updatedItems });
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: typeof createOrderForm.items) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500, else 50
    const total = subtotal + tax + shipping;

    setCreateOrderForm((prev) => ({
      ...prev,
      items,
      subtotal,
      tax,
      shipping,
      total,
    }));
  };

  const handleCreateOrder = async () => {
    if (!createOrderForm.customerName || !createOrderForm.phone || !createOrderForm.address) {
      showToast('Please fill in all customer information', 'error');
      return;
    }

    if (createOrderForm.items.length === 0) {
      showToast('Please add at least one item to the order', 'error');
      return;
    }

    setCreatingOrder(true);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: createOrderForm.customerName,
          phone: createOrderForm.phone,
          address: createOrderForm.address,
          items: createOrderForm.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            image: item.image,
          })),
          subtotal: createOrderForm.subtotal,
          tax: createOrderForm.tax,
          shipping: createOrderForm.shipping,
          total: createOrderForm.total,
          status: createOrderForm.status,
          orderDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const newOrder = await response.json();
        showToast(`Order created successfully! Order ID: ${newOrder.orderId}`, 'success');
        setIsCreateOrderDialogOpen(false);
        // Reset form
        setCreateOrderForm({
          customerName: '',
          phone: '',
          address: '',
          status: 'pending',
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        });
        fetchOrders();
      } else {
        const error = await response.json();
        showToast(`Failed to create order: ${error.error || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      showToast(`Error: ${error.message || 'Failed to create order'}`, 'error');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleOpenCreateOrder = () => {
    setIsCreateOrderDialogOpen(true);
    fetchProducts();
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      console.log('Fetching order:', orderId);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Order data received:', data);
        setSelectedOrder(data);
        setEditForm({
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          status: data.status || 'pending',
        });
        setIsDialogOpen(true);
        setIsEditing(false);
        console.log('Dialog should be open now');
      } else {
        let errorData;
        try {
          const text = await response.text();
          console.log('Error response text:', text);
          errorData = text ? JSON.parse(text) : { error: `HTTP ${response.status}: ${response.statusText}` };
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorData = { 
            error: `HTTP ${response.status}: ${response.statusText}`,
            message: 'Failed to parse error response'
          };
        }
        console.error('Failed to fetch order:', errorData);
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        showToast(`Failed to load order: ${errorMessage}`, 'error');
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showToast(`Error loading order: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const handleEditOrder = () => {
    setIsEditing(true);
  };

  const handleSendToSteadfast = async (orderId: string) => {
    setSendingToSteadfast(orderId);
    try {
      const response = await fetch('/api/admin/orders/steadfast/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, deliveryType: 0 }), // 0 = home delivery
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Order sent to Steadfast Courier successfully! Tracking Code: ${data.consignment.trackingCode}`, 'success');
        fetchOrders(); // Refresh orders list
        if (selectedOrder?.orderId === orderId) {
          // Update selected order if it's the one being viewed
          const updatedOrder = await fetch(`/api/admin/orders/${orderId}`).then(r => r.json());
          setSelectedOrder(updatedOrder);
        }
      } else {
        showToast(`Failed to send order: ${data.message || data.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Error sending order to Steadfast:', error);
      showToast(`Error: ${error.message || 'Failed to send order to Steadfast Courier'}`, 'error');
    } finally {
      setSendingToSteadfast(null);
    }
  };

  const handleCheckSteadfastStatus = async (orderId: string) => {
    setCheckingStatus(orderId);
    try {
      const response = await fetch('/api/admin/orders/steadfast/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Delivery Status: ${data.deliveryStatus} | Tracking Code: ${data.trackingCode || 'N/A'}`, 'success');
        fetchOrders(); // Refresh orders list
        if (selectedOrder?.orderId === orderId) {
          // Update selected order if it's the one being viewed
          const updatedOrder = await fetch(`/api/admin/orders/${orderId}`).then(r => r.json());
          setSelectedOrder(updatedOrder);
        }
      } else {
        showToast(`Failed to check status: ${data.message || data.error}`, 'error');
      }
    } catch (error: any) {
      console.error('Error checking Steadfast status:', error);
      showToast(`Error: ${error.message || 'Failed to check delivery status'}`, 'error');
    } finally {
      setCheckingStatus(null);
    }
  };

  const handleCheckFraud = async (orderId: string) => {
    setCheckingFraud(orderId);
    try {
      const response = await fetch('/api/admin/orders/fraud-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const result = data.result;
        // Store result and open modal
        setFraudCheckResult({
          orderId,
          result: result,
        });
        setIsFraudResultDialogOpen(true);
        
        fetchOrders();
        if (selectedOrder?.orderId === orderId) {
          const updatedOrder = await fetch(`/api/admin/orders/${orderId}`).then(r => r.json());
          setSelectedOrder(updatedOrder);
        }
      } else {
        showToast(`Failed to check fraud: ${data.message || data.error || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      console.error('Error checking fraud:', error);
      showToast(`Error: ${error.message || 'Failed to check fraud status'}`, 'error');
    } finally {
      setCheckingFraud(null);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedOrder(updated);
        setIsEditing(false);
        fetchOrders(); // Refresh orders list
        showToast('Order updated successfully!', 'success');
      } else {
        showToast('Failed to update order', 'error');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Error updating order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedOrder) {
      setEditForm({
        customerName: selectedOrder.customerName,
        phone: selectedOrder.phone,
        address: selectedOrder.address,
        status: selectedOrder.status || 'pending',
      });
    }
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={8} columns={8} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {ToastComponent}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders
            </p>
          </div>
          <Button onClick={handleOpenCreateOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, phone, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            All Orders ({filteredOrders.length} {searchQuery ? `of ${orders.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No orders found matching your search' : 'No orders found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    {isModuleEnabled('steadfast-courier') && <TableHead>Steadfast</TableHead>}
                    {isModuleEnabled('fraud-check') && <TableHead>Fraud</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-mono text-sm">
                        {order.orderId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customerName}
                      </TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{order.items.length} item(s)</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ৳{order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={getStatusColor(order.status || 'pending')}
                        >
                          {order.status || 'Pending'}
                        </Badge>
                        </TableCell>
                        {isModuleEnabled('steadfast-courier') && (
                        <TableCell>
                          {order.steadfastTrackingCode ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="text-xs">
                              {order.steadfastTrackingCode}
                            </Badge>
                            {order.steadfastStatus && (
                              <span className="text-xs text-muted-foreground">
                                {order.steadfastStatus}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not sent</span>
                        )}
                      </TableCell>
                      )}
                      {isModuleEnabled('fraud-check') && (
                      <TableCell>
                        {order.fraudChecked && order.fraudCheckResult ? (
                          <div className="flex flex-col gap-1">
                            {order.fraudCheckResult.success ? (
                              <>
                                <Badge
                                  variant={
                                    order.fraudCheckResult.riskLevel === 'high'
                                      ? 'destructive'
                                      : order.fraudCheckResult.riskLevel === 'medium'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {order.fraudCheckResult.riskLevel?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                                {typeof order.fraudCheckResult.successRatio === 'number' &&
                                  Number.isFinite(order.fraudCheckResult.successRatio) && (
                                  <span className="text-xs text-muted-foreground">
                                    {order.fraudCheckResult.successRatio.toFixed(1)}% success
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">Check failed</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not checked</span>
                        )}
                      </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isModuleEnabled('fraud-check') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCheckFraud(order.orderId);
                            }}
                            disabled={checkingFraud === order.orderId}
                            type="button"
                            title="Check Fraud Status"
                          >
                            {order.fraudCheckResult?.riskLevel === 'high' ? (
                              <ShieldAlert className={`h-4 w-4 text-red-500 ${checkingFraud === order.orderId ? 'animate-pulse' : ''}`} />
                            ) : (
                              <Shield className={`h-4 w-4 ${checkingFraud === order.orderId ? 'animate-spin' : ''}`} />
                            )}
                          </Button>
                          )}
                          {isModuleEnabled('steadfast-courier') && order.steadfastTrackingCode && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCheckSteadfastStatus(order.orderId);
                              }}
                              disabled={checkingStatus === order.orderId}
                              type="button"
                              title="Check Steadfast Status"
                            >
                              <RefreshCw className={`h-4 w-4 ${checkingStatus === order.orderId ? 'animate-spin' : ''}`} />
                            </Button>
                          )}
                          {isModuleEnabled('steadfast-courier') && !order.steadfastConsignmentId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSendToSteadfast(order.orderId);
                              }}
                              disabled={sendingToSteadfast === order.orderId}
                              type="button"
                              title="Send to Steadfast Courier"
                            >
                              <Truck className={`h-4 w-4 ${sendingToSteadfast === order.orderId ? 'animate-pulse' : ''}`} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('View button clicked for order:', order.orderId);
                              handleViewOrder(order.orderId);
                            }}
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order View/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedOrder?.orderId || 'Loading...'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Edit order information' : 'View order details'}
            </DialogDescription>
          </DialogHeader>

          {!selectedOrder ? (
            <div className="flex justify-center items-center py-8">
              <div className="space-y-4 w-full">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-64 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    {isEditing ? (
                      <Input
                        id="customerName"
                        value={editForm.customerName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, customerName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.customerName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.address}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                      <select
                        id="status"
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={getStatusColor(selectedOrder.status || 'pending')}
                      >
                        {selectedOrder.status || 'Pending'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Items</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => {
                        const isImageUrl = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded overflow-hidden flex-shrink-0">
                                  {isImageUrl ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xl">{item.image}</span>
                                  )}
                                </div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                            ৳{item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ৳{(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>৳{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>৳{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>৳{selectedOrder.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">
                    ৳{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Order Date: {new Date(selectedOrder.orderDate).toLocaleString()}</p>
              </div>

              {/* Fraud Check Information */}
              {selectedOrder.fraudChecked && selectedOrder.fraudCheckResult ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Fraud Check</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckFraud(selectedOrder.orderId)}
                      disabled={checkingFraud === selectedOrder.orderId}
                    >
                      {checkingFraud === selectedOrder.orderId ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Re-check
                    </Button>
                  </div>
                  {selectedOrder.fraudCheckResult.success ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Risk Level</Label>
                          <Badge
                            variant={
                              selectedOrder.fraudCheckResult.riskLevel === 'high'
                                ? 'destructive'
                                : selectedOrder.fraudCheckResult.riskLevel === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {selectedOrder.fraudCheckResult.riskLevel?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </div>
                        {typeof selectedOrder.fraudCheckResult.successRatio === 'number' &&
                          Number.isFinite(selectedOrder.fraudCheckResult.successRatio) && (
                          <div className="space-y-2">
                            <Label>Success Ratio</Label>
                            <p className="text-sm font-semibold">
                              {selectedOrder.fraudCheckResult.successRatio.toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {selectedOrder.fraudCheckResult.totalOrders !== undefined && (
                          <div className="space-y-2">
                            <Label>Total Orders</Label>
                            <p className="text-sm">{selectedOrder.fraudCheckResult.totalOrders}</p>
                          </div>
                        )}
                        {selectedOrder.fraudCheckResult.successfulOrders !== undefined && (
                          <div className="space-y-2">
                            <Label>Successful Orders</Label>
                            <p className="text-sm text-green-600">
                              {selectedOrder.fraudCheckResult.successfulOrders}
                            </p>
                          </div>
                        )}
                        {selectedOrder.fraudCheckResult.failedOrders !== undefined && (
                          <div className="space-y-2">
                            <Label>Failed Orders</Label>
                            <p className="text-sm text-red-600">
                              {selectedOrder.fraudCheckResult.failedOrders}
                            </p>
                          </div>
                        )}
                        {selectedOrder.fraudCheckResult.fraudScore !== undefined && (
                          <div className="space-y-2">
                            <Label>Fraud Score</Label>
                            <p className="text-sm">{selectedOrder.fraudCheckResult.fraudScore}</p>
                          </div>
                        )}
                        {selectedOrder.fraudCheckAt && (
                          <div className="space-y-2">
                            <Label>Checked At</Label>
                            <p className="text-sm">{new Date(selectedOrder.fraudCheckAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedOrder.fraudCheckResult.courierData && Object.keys(selectedOrder.fraudCheckResult.courierData).length > 0 && (
                        <div className="mt-6 space-y-4">
                          <h4 className="font-semibold text-md">Courier Statistics</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(selectedOrder.fraudCheckResult.courierData).map(([key, courier]) => (
                              <Card key={key} className="p-3">
                                <div className="flex items-center gap-3">
                                  {courier.logo && (
                                    <img 
                                      src={courier.logo} 
                                      alt={courier.name}
                                      className="w-10 h-10 object-contain rounded"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-medium text-sm">{courier.name}</p>
                                      <Badge variant={courier.success_ratio >= 75 ? 'default' : courier.success_ratio >= 50 ? 'secondary' : 'destructive'}>
                                        {courier.success_ratio.toFixed(1)}%
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                      <div>
                                        <span className="font-medium">Total:</span> {courier.total_parcel}
                                      </div>
                                      <div className="text-green-600">
                                        <span className="font-medium">Success:</span> {courier.success_parcel}
                                      </div>
                                      <div className="text-red-600">
                                        <span className="font-medium">Cancelled:</span> {courier.cancelled_parcel}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                          {selectedOrder.fraudCheckResult.summary && (
                            <Card className="p-3 bg-muted">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">Overall Summary</p>
                                <Badge variant={selectedOrder.fraudCheckResult.summary.success_ratio >= 75 ? 'default' : selectedOrder.fraudCheckResult.summary.success_ratio >= 50 ? 'secondary' : 'destructive'}>
                                  {selectedOrder.fraudCheckResult.summary.success_ratio.toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-2">
                                <div>
                                  <span className="font-medium">Total:</span> {selectedOrder.fraudCheckResult.summary.total_parcel}
                                </div>
                                <div className="text-green-600">
                                  <span className="font-medium">Success:</span> {selectedOrder.fraudCheckResult.summary.success_parcel}
                                </div>
                                <div className="text-red-600">
                                  <span className="font-medium">Cancelled:</span> {selectedOrder.fraudCheckResult.summary.cancelled_parcel}
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Fraud check failed or no data available.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Fraud Check</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckFraud(selectedOrder.orderId)}
                      disabled={checkingFraud === selectedOrder.orderId}
                    >
                      {checkingFraud === selectedOrder.orderId ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Check Fraud
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">This order has not been checked for fraud yet.</p>
                </div>
              )}

              {/* Steadfast Courier Information */}
              {isModuleEnabled('steadfast-courier') && (
                (selectedOrder.steadfastConsignmentId || selectedOrder.steadfastTrackingCode) ? (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg">Steadfast Courier</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOrder.steadfastConsignmentId && (
                        <div className="space-y-2">
                          <Label>Consignment ID</Label>
                          <p className="text-sm font-mono">{selectedOrder.steadfastConsignmentId}</p>
                        </div>
                      )}
                      {selectedOrder.steadfastTrackingCode && (
                        <div className="space-y-2">
                          <Label>Tracking Code</Label>
                          <p className="text-sm font-mono">{selectedOrder.steadfastTrackingCode}</p>
                        </div>
                      )}
                      {selectedOrder.steadfastStatus && (
                        <div className="space-y-2">
                          <Label>Delivery Status</Label>
                          <Badge variant="secondary">{selectedOrder.steadfastStatus}</Badge>
                        </div>
                      )}
                      {selectedOrder.steadfastSentAt && (
                        <div className="space-y-2">
                          <Label>Sent At</Label>
                          <p className="text-sm">{new Date(selectedOrder.steadfastSentAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg">Steadfast Courier</h3>
                    <p className="text-sm text-muted-foreground">This order has not been sent to Steadfast Courier yet.</p>
                  </div>
                )
              )}
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveOrder} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  {selectedOrder && !selectedOrder.steadfastConsignmentId && (
                    <Button
                      variant="outline"
                      onClick={() => handleSendToSteadfast(selectedOrder.orderId)}
                      disabled={sendingToSteadfast === selectedOrder.orderId}
                    >
                      <Truck className={`h-4 w-4 mr-2 ${sendingToSteadfast === selectedOrder.orderId ? 'animate-pulse' : ''}`} />
                      {sendingToSteadfast === selectedOrder.orderId ? 'Sending...' : 'Send to Steadfast'}
                    </Button>
                  )}
                  {selectedOrder && selectedOrder.steadfastTrackingCode && (
                    <Button
                      variant="outline"
                      onClick={() => handleCheckSteadfastStatus(selectedOrder.orderId)}
                      disabled={checkingStatus === selectedOrder.orderId}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${checkingStatus === selectedOrder.orderId ? 'animate-spin' : ''}`} />
                      {checkingStatus === selectedOrder.orderId ? 'Checking...' : 'Check Status'}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={handleEditOrder}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fraud Check Result Dialog */}
      <Dialog open={isFraudResultDialogOpen} onOpenChange={setIsFraudResultDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Track Courier Orders</DialogTitle>
            <DialogDescription>
              Order ID: {fraudCheckResult?.orderId}
            </DialogDescription>
          </DialogHeader>

          {fraudCheckResult?.result ? (
            fraudCheckResult.result.success ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                {fraudCheckResult.result.summary && (
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Total Orders</Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {fraudCheckResult.result.summary.total_parcel}
                        </p>
                      </div>
                    </Card>
                    <Card className="p-4 border-green-500/20 bg-green-500/5">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Successful</Label>
                        <p className="text-2xl font-bold text-green-600">
                          {fraudCheckResult.result.summary.success_parcel}
                        </p>
                      </div>
                    </Card>
                    <Card className="p-4 border-red-500/20 bg-red-500/5">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Cancelled</Label>
                        <p className="text-2xl font-bold text-red-600">
                          {fraudCheckResult.result.summary.cancelled_parcel}
                        </p>
                      </div>
                    </Card>
                    <Card className="p-4 border-purple-500/20 bg-purple-500/5">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Success Rate</Label>
                        <p className="text-2xl font-bold text-purple-600">
                          {fraudCheckResult.result.summary.success_ratio.toFixed(2)}%
                        </p>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Two Column Layout: Table and Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Courier Table */}
                  {fraudCheckResult.result.courierData && Object.keys(fraudCheckResult.result.courierData).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Courier Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>COURIER</TableHead>
                                <TableHead className="text-center">TOTAL</TableHead>
                                <TableHead className="text-center">SUCCESS</TableHead>
                                <TableHead className="text-center">CANCEL</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(fraudCheckResult.result.courierData).map(([key, courier]) => (
                                <TableRow key={key}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {courier.logo && (
                                        <img 
                                          src={courier.logo} 
                                          alt={courier.name}
                                          className="w-8 h-8 object-contain"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <span className="font-medium">{courier.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">{courier.total_parcel}</TableCell>
                                  <TableCell className="text-center text-green-600">{courier.success_parcel}</TableCell>
                                  <TableCell className="text-center text-red-600">{courier.cancelled_parcel}</TableCell>
                                </TableRow>
                              ))}
                              {fraudCheckResult.result.summary && (
                                <TableRow className="font-bold bg-muted">
                                  <TableCell>Total</TableCell>
                                  <TableCell className="text-center">{fraudCheckResult.result.summary.total_parcel}</TableCell>
                                  <TableCell className="text-center text-green-600">{fraudCheckResult.result.summary.success_parcel}</TableCell>
                                  <TableCell className="text-center text-red-600">{fraudCheckResult.result.summary.cancelled_parcel}</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Delivery Status Chart */}
                  {fraudCheckResult.result.summary && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Delivery Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Successful', value: fraudCheckResult.result.summary.success_parcel, fill: '#10b981' },
                                  { name: 'Cancelled', value: fraudCheckResult.result.summary.cancelled_parcel, fill: '#ef4444' },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {[
                                  { name: 'Successful', value: fraudCheckResult.result.summary.success_parcel, fill: '#10b981' },
                                  { name: 'Cancelled', value: fraudCheckResult.result.summary.cancelled_parcel, fill: '#ef4444' },
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend 
                                verticalAlign="bottom"
                                iconType="square"
                                formatter={(value) => (
                                  <span className="text-sm">{value}</span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Fraud Check Alert */}
                {typeof fraudCheckResult.result.successRatio === 'number' &&
                  Number.isFinite(fraudCheckResult.result.successRatio) && (
                  <div className={`p-4 rounded-lg border ${
                    fraudCheckResult.result.successRatio >= 75
                      ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                      : fraudCheckResult.result.successRatio >= 50
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      {fraudCheckResult.result.successRatio >= 75 ? (
                        <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      ) : (
                        <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {fraudCheckResult.result.successRatio >= 75
                            ? 'High Success Rate'
                            : fraudCheckResult.result.successRatio >= 50
                            ? 'Moderate Success Rate'
                            : 'Low Success Rate'}: {fraudCheckResult.result.successRatio.toFixed(1)}%
                        </p>
                        <p className="text-sm mt-1">
                          {fraudCheckResult.result.successRatio >= 75
                            ? 'This customer appears safe based on previous records.'
                            : fraudCheckResult.result.successRatio >= 50
                            ? 'This customer has a moderate order history. Review carefully.'
                            : 'This customer has a low success rate. Exercise caution.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Fraud check completed but no data available.</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No fraud check result available.</p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsFraudResultDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Manually create a new order for a customer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-customerName">Customer Name *</Label>
                  <Input
                    id="create-customerName"
                    value={createOrderForm.customerName}
                    onChange={(e) =>
                      setCreateOrderForm({ ...createOrderForm, customerName: e.target.value })
                    }
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-phone">Phone Number *</Label>
                  <Input
                    id="create-phone"
                    value={createOrderForm.phone}
                    onChange={(e) =>
                      setCreateOrderForm({ ...createOrderForm, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="create-address">Address *</Label>
                  <Input
                    id="create-address"
                    value={createOrderForm.address}
                    onChange={(e) =>
                      setCreateOrderForm({ ...createOrderForm, address: e.target.value })
                    }
                    placeholder="Enter delivery address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-status">Status</Label>
                  <select
                    id="create-status"
                    value={createOrderForm.status}
                    onChange={(e) =>
                      setCreateOrderForm({ ...createOrderForm, status: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Add Products */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Order Products</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductSelectionOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Products
                </Button>
              </div>
              {createOrderForm.items.length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No products added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProductSelectionOpen(true)}
                  >
                    Add Products
                  </Button>
                </div>
              )}
            </div>

            {/* Order Items */}
            {createOrderForm.items.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Items</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {createOrderForm.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded overflow-hidden flex-shrink-0">
                                {item.image && (item.image.startsWith('/') || item.image.startsWith('http')) ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xl">{item.image}</span>
                                )}
                              </div>
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>৳{item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItemQuantity(index, parseInt(e.target.value) || 1)
                                }
                                className="w-20 text-center"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Order Summary */}
            {createOrderForm.items.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>৳{createOrderForm.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (5%):</span>
                  <span>৳{createOrderForm.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span>
                    {createOrderForm.subtotal > 500 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `৳${createOrderForm.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">
                    ৳{createOrderForm.total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOrderDialogOpen(false);
                setCreateOrderForm({
                  customerName: '',
                  phone: '',
                  address: '',
                  status: 'pending',
                  items: [],
                  subtotal: 0,
                  tax: 0,
                  shipping: 0,
                  total: 0,
                });
              }}
              disabled={creatingOrder}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={creatingOrder || createOrderForm.items.length === 0}>
              {creatingOrder ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Selection Dialog */}
      <Dialog open={isProductSelectionOpen} onOpenChange={setIsProductSelectionOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
            <DialogDescription>
              Choose products to add to the order
            </DialogDescription>
          </DialogHeader>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
              {products.map((product) => {
                const isAdded = createOrderForm.items.some(
                  (item) => item.productId === product.id
                );
                const addedItem = createOrderForm.items.find(
                  (item) => item.productId === product.id
                );

                return (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                      isAdded ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleAddProductToOrder(product)}
                  >
                    <div className="aspect-square w-full mb-2 flex items-center justify-center bg-muted rounded overflow-hidden">
                      {product.image && (product.image.startsWith('/') || product.image.startsWith('http')) ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{product.image}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                      <p className="text-sm font-semibold text-primary">
                        ৳{product.price.toFixed(2)}
                      </p>
                      {isAdded && addedItem && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">
                            Qty: {addedItem.quantity}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Added
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductSelectionOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
