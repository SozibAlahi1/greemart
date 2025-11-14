import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/orders
export async function GET(request: NextRequest) {
  const orders = await prisma.order.findMany({
    include: {
      items: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Transform to match expected format
  const formattedOrders = orders.map(order => ({
    orderId: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items.map(item => ({
      productId: item.productId,
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
  }));

  return NextResponse.json(formattedOrders);
}

// POST /api/admin/orders (called from checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerName, phone, address, items, subtotal, tax, shipping, total, orderDate } = body;

    // Generate order ID if not provided
    const finalOrderId = orderId || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
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
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            image: item.image
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Format response
    const formattedOrder = {
      orderId: order.orderId,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items.map(item => ({
        productId: item.productId,
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
  const orders = await prisma.order.findMany({
    include: {
      items: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return orders.map(order => ({
    orderId: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items.map(item => ({
      productId: item.productId,
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
  }));
}

export async function getOrder(id: string) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderId: id },
        { id: id }
      ]
    },
    include: {
      items: true
    }
  });

  if (!order) return null;

  return {
    orderId: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    items: order.items.map(item => ({
      productId: item.productId,
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
}
