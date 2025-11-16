'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getSessionId } from '@/lib/session';

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch('/api/cart', {
        headers: {
          'x-session-id': sessionId
        }
      });
      const data = await response.json();
      setCart(data);
      if (data.length === 0) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate order totals
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotal = total;
    const tax = subtotal * 0.08;
    const shipping = 5.99;
    const finalTotal = subtotal + tax + shipping;

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order information
    const orderInfo = {
      orderId,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      items: cart,
      subtotal,
      tax,
      shipping,
      total: finalTotal,
      orderDate: new Date().toISOString()
    };

    // Store order in admin API
    await fetch('/api/admin/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderInfo),
    });

    // Store order info in localStorage for thank you page
    localStorage.setItem('lastOrder', JSON.stringify(orderInfo));
    
    // Clear cart
    const sessionId = getSessionId();
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'x-session-id': sessionId
      }
    });

    // Redirect to thank you page
    router.push('/thank-you');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = total;
  const tax = subtotal * 0.08;
  const shipping = 5.99;
  const finalTotal = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Shipping & Payment Form - Left Side */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="pt-4 border-t">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Payment Method</h3>
                    <p className="text-sm text-muted-foreground">
                      Cash on Delivery (COD) - Pay when you receive your order
                    </p>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                >
                  Place Order
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Right Side */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {cart.map((item) => {
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
                          <span>৳{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax:</span>
                          <span>৳{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping:</span>
                          <span>৳{shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-4 border-t">
                          <span>Total:</span>
                          <span className="text-primary">৳{finalTotal.toFixed(2)}</span>
                        </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


