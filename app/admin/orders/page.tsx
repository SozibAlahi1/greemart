'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Eye, Edit, Save, X, Truck, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}

export default function AdminOrders() {
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

  useEffect(() => {
    fetchOrders();
  }, []);

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
        alert(`Failed to load order: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Error loading order: ${error.message || 'Unknown error'}. Please check the console for details.`);
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
        alert(`Order sent to Steadfast Courier successfully!\nTracking Code: ${data.consignment.trackingCode}\nConsignment ID: ${data.consignment.consignmentId}`);
        fetchOrders(); // Refresh orders list
        if (selectedOrder?.orderId === orderId) {
          // Update selected order if it's the one being viewed
          const updatedOrder = await fetch(`/api/admin/orders/${orderId}`).then(r => r.json());
          setSelectedOrder(updatedOrder);
        }
      } else {
        alert(`Failed to send order: ${data.message || data.error}`);
      }
    } catch (error: any) {
      console.error('Error sending order to Steadfast:', error);
      alert(`Error: ${error.message || 'Failed to send order to Steadfast Courier'}`);
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
        alert(`Delivery Status: ${data.deliveryStatus}\nTracking Code: ${data.trackingCode || 'N/A'}`);
        fetchOrders(); // Refresh orders list
        if (selectedOrder?.orderId === orderId) {
          // Update selected order if it's the one being viewed
          const updatedOrder = await fetch(`/api/admin/orders/${orderId}`).then(r => r.json());
          setSelectedOrder(updatedOrder);
        }
      } else {
        alert(`Failed to check status: ${data.message || data.error}`);
      }
    } catch (error: any) {
      console.error('Error checking Steadfast status:', error);
      alert(`Error: ${error.message || 'Failed to check delivery status'}`);
    } finally {
      setCheckingStatus(null);
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
        alert('Order updated successfully!');
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">
          Manage customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
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
                    <TableHead>Steadfast</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.steadfastTrackingCode && (
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
                          {!order.steadfastConsignmentId && (
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

              {/* Steadfast Courier Information */}
              {selectedOrder.steadfastConsignmentId || selectedOrder.steadfastTrackingCode ? (
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
    </div>
  );
}
