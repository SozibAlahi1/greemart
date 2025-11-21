'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, ShoppingCart, Bell, Loader2, Plus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { ModuleGuard } from '@/components/modules/ModuleGuard';
import { useToast } from '@/app/components/Toast';
import PageSkeleton from '@/components/skeletons/PageSkeleton';

interface BroadcastRecipient {
  phone: string;
  name?: string;
}

export default function WhatsAppMarketingPage() {
  return (
    <ModuleGuard moduleId="whatsapp-marketing">
      <WhatsAppMarketingContent />
    </ModuleGuard>
  );
}

function WhatsAppMarketingContent() {
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('send');
  
  // Send Message State
  const [sendPhone, setSendPhone] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  
  // Broadcast State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  
  // Cart Recovery State
  const [cartRecoveryPhone, setCartRecoveryPhone] = useState('');
  const [cartItems, setCartItems] = useState<Array<{ name: string; quantity: number; price: number }>>([]);
  const [newCartItem, setNewCartItem] = useState({ name: '', quantity: 1, price: 0 });
  const [cartItemDialogOpen, setCartItemDialogOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!sendPhone.trim() || !sendMessage.trim()) {
      showToast('Please enter phone number and message', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: sendPhone.trim(),
          message: sendMessage.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast('Message sent successfully', 'success');
        setSendPhone('');
        setSendMessage('');
      } else {
        showToast(data.error || 'Failed to send message', 'error');
      }
    } catch (error: any) {
      showToast('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) return;
    
    const phone = newRecipient.trim().replace(/\D/g, '');
    if (phone.length < 10) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    setRecipients([...recipients, { phone }]);
    setNewRecipient('');
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSendBroadcast = async () => {
    if (recipients.length === 0) {
      showToast('Please add at least one recipient', 'error');
      return;
    }

    if (!broadcastMessage.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients.map(r => r.phone),
          message: broadcastMessage.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(`Broadcast sent: ${data.success} successful, ${data.failed} failed`, 'success');
        setRecipients([]);
        setBroadcastMessage('');
        setBroadcastDialogOpen(false);
      } else {
        showToast(data.error || 'Failed to send broadcast', 'error');
      }
    } catch (error: any) {
      showToast('Failed to send broadcast', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCartItem = () => {
    if (!newCartItem.name.trim() || newCartItem.price <= 0) {
      showToast('Please enter item name and price', 'error');
      return;
    }

    setCartItems([...cartItems, { ...newCartItem }]);
    setNewCartItem({ name: '', quantity: 1, price: 0 });
    setCartItemDialogOpen(false);
  };

  const handleSendCartRecovery = async () => {
    if (!cartRecoveryPhone.trim()) {
      showToast('Please enter phone number', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Please add at least one cart item', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/whatsapp/cart-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cartRecoveryPhone.trim(),
          cartItems,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast('Cart recovery message sent successfully', 'success');
        setCartRecoveryPhone('');
        setCartItems([]);
      } else {
        showToast(data.error || 'Failed to send cart recovery message', 'error');
      }
    } catch (error: any) {
      showToast('Failed to send cart recovery message', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Marketing</h1>
        <p className="text-muted-foreground">
          Send direct messages, cart recovery, notifications, and broadcasts to increase sales and engagement
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </TabsTrigger>
          <TabsTrigger value="broadcast">
            <Users className="h-4 w-4 mr-2" />
            Broadcast
          </TabsTrigger>
          <TabsTrigger value="cart-recovery">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart Recovery
          </TabsTrigger>
        </TabsList>

        {/* Send Message Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send Direct Message</CardTitle>
              <CardDescription>
                Send a personalized WhatsApp message to a customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="8801712345678"
                  value={sendPhone}
                  onChange={(e) => setSendPhone(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter phone number with country code (e.g., 8801712345678)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  disabled={loading}
                  rows={6}
                />
              </div>
              <Button onClick={handleSendMessage} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle>Send Broadcast</CardTitle>
              <CardDescription>
                Send the same message to multiple recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipients</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter phone number"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                  />
                  <Button onClick={handleAddRecipient} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipients.map((recipient, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {recipient.phone}
                        <button
                          onClick={() => handleRemoveRecipient(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcast-message">Message</Label>
                <Textarea
                  id="broadcast-message"
                  placeholder="Enter broadcast message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  disabled={loading}
                  rows={6}
                />
              </div>
              <Button onClick={handleSendBroadcast} disabled={loading || recipients.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Send to {recipients.length} Recipient{recipients.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cart Recovery Tab */}
        <TabsContent value="cart-recovery">
          <Card>
            <CardHeader>
              <CardTitle>Cart Recovery</CardTitle>
              <CardDescription>
                Send automated cart recovery messages to customers with abandoned carts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cart-phone">Customer Phone Number</Label>
                <Input
                  id="cart-phone"
                  type="tel"
                  placeholder="8801712345678"
                  value={cartRecoveryPhone}
                  onChange={(e) => setCartRecoveryPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cart Items</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCartItemDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                {cartItems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>৳{item.price.toFixed(2)}</TableCell>
                          <TableCell>৳{(item.quantity * item.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCartItems(cartItems.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No items added yet</p>
                )}
              </div>
              <Button onClick={handleSendCartRecovery} disabled={loading || cartItems.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Send Cart Recovery
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Cart Item Dialog */}
      <Dialog open={cartItemDialogOpen} onOpenChange={setCartItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cart Item</DialogTitle>
            <DialogDescription>
              Add an item to the cart recovery message
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={newCartItem.name}
                onChange={(e) => setNewCartItem({ ...newCartItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-quantity">Quantity</Label>
                <Input
                  id="item-quantity"
                  type="number"
                  min="1"
                  value={newCartItem.quantity}
                  onChange={(e) => setNewCartItem({ ...newCartItem, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-price">Price</Label>
                <Input
                  id="item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCartItem.price}
                  onChange={(e) => setNewCartItem({ ...newCartItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCartItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCartItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {ToastComponent}
    </div>
  );
}

