import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

  if (!order) {
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  }

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

  return NextResponse.json(formattedOrder);
}

// PATCH /api/admin/orders/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { customerName, phone, address, status, subtotal, tax, shipping, total } = body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderId: id },
          { id: id }
        ]
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        ...(customerName && { customerName }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(status && { status }),
        ...(subtotal !== undefined && { subtotal }),
        ...(tax !== undefined && { tax }),
        ...(shipping !== undefined && { shipping }),
        ...(total !== undefined && { total })
      },
      include: {
        items: true
      }
    });

    const formattedOrder = {
      orderId: updated.orderId,
      customerName: updated.customerName,
      phone: updated.phone,
      address: updated.address,
      items: updated.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      })),
      subtotal: updated.subtotal,
      tax: updated.tax,
      shipping: updated.shipping,
      total: updated.total,
      orderDate: updated.orderDate.toISOString(),
      status: updated.status
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}


