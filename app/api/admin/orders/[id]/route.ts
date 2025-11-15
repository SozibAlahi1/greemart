import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET /api/admin/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  
  const order = await Order.findOne({
    $or: [
      { orderId: id },
      { _id: id }
    ]
  }).lean();

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
    items: order.items.map((item) => ({
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

  return NextResponse.json(formattedOrder);
}

// PATCH /api/admin/orders/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { customerName, phone, address, status, subtotal, tax, shipping, total } = body;

    const order = await Order.findOne({
      $or: [
        { orderId: id },
        { _id: id }
      ]
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (customerName) order.customerName = customerName;
    if (phone) order.phone = phone;
    if (address) order.address = address;
    if (status) order.status = status;
    if (subtotal !== undefined) order.subtotal = subtotal;
    if (tax !== undefined) order.tax = tax;
    if (shipping !== undefined) order.shipping = shipping;
    if (total !== undefined) order.total = total;

    await order.save();

    const formattedOrder = {
      orderId: order.orderId,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      items: order.items.map((item) => ({
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

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
