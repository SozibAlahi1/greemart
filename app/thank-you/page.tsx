'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Home, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageSkeleton from '@/components/skeletons/PageSkeleton';

interface OrderItem {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface OrderInfo {
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
}

function ThankYouContent() {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order info from localStorage (set by checkout page)
    const storedOrder = localStorage.getItem('lastOrder');
    if (storedOrder) {
      try {
        const order = JSON.parse(storedOrder);
        setOrderInfo(order);
        // Clear the stored order after displaying
        localStorage.removeItem('lastOrder');
      } catch (error) {
        console.error('Error parsing order info:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!orderInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find your order information.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">Thank You for Your Order!</h1>
        <p className="text-muted-foreground text-lg">
          Your order has been placed successfully
        </p>
        <Badge className="mt-4" variant="secondary">
          Order ID: {orderInfo.orderId}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {orderInfo.items.map((item) => {
                const isImageUrl = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));
                return (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-muted rounded overflow-hidden">
                      {isImageUrl ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">{item.image}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">Quantity: {item.quantity}</p>
                      <p className="text-primary font-semibold mt-1">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>৳{orderInfo.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>৳{orderInfo.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping:</span>
                <span>৳{orderInfo.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t">
                <span>Total:</span>
                <span className="text-primary">৳{orderInfo.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Customer Name</h3>
              <p className="text-base">{orderInfo.customerName}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Phone Number</h3>
              <p className="text-base">{orderInfo.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Delivery Address</h3>
              <p className="text-base">{orderInfo.address}</p>
            </div>
            <div className="pt-4 border-t">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Payment Method</h3>
                <p className="text-base font-medium">Cash on Delivery (COD)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please have the exact amount ready for the delivery person.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Order Date</h3>
              <p className="text-base">{new Date(orderInfo.orderDate).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Browse Products
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}

