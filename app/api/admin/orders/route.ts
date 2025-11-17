import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { OrderLean, IOrderItem, OrderItemLean } from '@/models/Order';
import mongoose from 'mongoose';

// GET /api/admin/orders
export async function GET(request: NextRequest) {
  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean<OrderLean[]>();

  const formattedOrders = orders.map((order) => ({
    orderId: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items.map((item: OrderItemLean) => {
      // Handle productId conversion - it might be string, ObjectId, or object with toString()
      let productIdStr: string;
      if (typeof item.productId === 'string') {
        productIdStr = item.productId;
      } else if (item.productId && typeof item.productId === 'object' && 'toString' in item.productId) {
        productIdStr = item.productId.toString();
      } else {
        productIdStr = String(item.productId);
      }
      
      return {
        productId: productIdStr,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      };
    }),
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    orderDate: order.orderDate.toISOString(),
    status: order.status
  }));

  return NextResponse.json(formattedOrders);
}

// POST /api/admin/orders (called from checkout)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { orderId, customerName, phone, address, items, subtotal, tax, shipping, total, orderDate } = body;

    // Generate order ID if not provided
    const finalOrderId = orderId || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items
    const order = await Order.create({
      orderId: finalOrderId,
      customerName,
      phone,
      address,
      subtotal,
      tax,
      shipping,
      total,
      status: 'pending',
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      }))
    });

    const formattedOrder = {
      orderId: order.orderId,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items.map((item: IOrderItem) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      orderDate: order.orderDate.toISOString(),
      status: order.status
    };

    return NextResponse.json(formattedOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Export function to get orders (for use in other modules)
export async function getOrders() {
  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean<OrderLean[]>();
  
  return orders.map((order) => ({
    orderId: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items.map((item: OrderItemLean) => {
      // Handle productId conversion - it might be string, ObjectId, or object with toString()
      let productIdStr: string;
      if (typeof item.productId === 'string') {
        productIdStr = item.productId;
      } else if (item.productId && typeof item.productId === 'object' && 'toString' in item.productId) {
        productIdStr = item.productId.toString();
      } else {
        productIdStr = String(item.productId);
      }
      
      return {
        productId: productIdStr,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      };
    }),
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    orderDate: order.orderDate.toISOString(),
    status: order.status
  }));
}

export async function getOrder(id: string) {
  await connectDB();
  
  // Build query - only include _id if it's a valid ObjectId
  const query: any = { orderId: id };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or = [
      { orderId: id },
      { _id: new mongoose.Types.ObjectId(id) }
    ];
  }
  
  const order = await Order.findOne(query).lean<OrderLean>();

  if (!order) return null;

  return {
    orderId: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items.map((item: OrderItemLean) => {
      // Handle productId conversion - it might be string, ObjectId, or object with toString()
      let productIdStr: string;
      if (typeof item.productId === 'string') {
        productIdStr = item.productId;
      } else if (item.productId && typeof item.productId === 'object' && 'toString' in item.productId) {
        productIdStr = item.productId.toString();
      } else {
        productIdStr = String(item.productId);
      }
      
      return {
        productId: productIdStr,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      };
    }),
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    orderDate: order.orderDate.toISOString(),
    status: order.status
  };
}
