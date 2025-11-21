import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { OrderLean, IOrderItem } from '@/models/Order';
import mongoose from 'mongoose';

// GET /api/admin/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    console.log('Fetching order with ID:', id);
    
    // Build query - only include _id if it's a valid ObjectId
    const query: any = { orderId: id };
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    
    console.log('Query params:', { id, isValidObjectId });
    
    // Only try to match _id if the id is a valid ObjectId format
    if (isValidObjectId) {
      query.$or = [
        { orderId: id },
        { _id: new mongoose.Types.ObjectId(id) }
      ];
      console.log('Using $or query with _id');
    } else {
      console.log('Using simple orderId query (not a valid ObjectId)');
    }
    
    console.log('Final query:', JSON.stringify(query, null, 2));
    const order = await Order.findOne(query);
    
    if (!order) {
      console.log('Order not found for ID:', id);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Convert to plain object manually to ensure proper serialization
    const orderPlain = order.toObject ? order.toObject() : order;

    console.log('Order found:', { 
      orderId: orderPlain.orderId, 
      itemsCount: orderPlain.items?.length,
      firstItemProductId: orderPlain.items?.[0]?.productId,
      firstItemProductIdType: typeof orderPlain.items?.[0]?.productId
    });

    // Format items - handle productId which might be ObjectId or string
    const formattedItems = (orderPlain.items || []).map((item: any) => {
      let productIdStr: string;
      try {
        if (typeof item.productId === 'string') {
          productIdStr = item.productId;
        } else if (item.productId && typeof item.productId === 'object') {
          // Handle Mongoose ObjectId
          if ('toString' in item.productId && typeof item.productId.toString === 'function') {
            productIdStr = item.productId.toString();
          } else if ('_id' in item.productId) {
            productIdStr = String(item.productId._id);
          } else {
            productIdStr = String(item.productId);
          }
        } else {
          productIdStr = String(item.productId || '');
        }
      } catch (err) {
        console.error('Error converting productId:', err, item);
        productIdStr = String(item.productId || '');
      }
      
      return {
        productId: productIdStr,
        quantity: item.quantity || 0,
        name: item.name || '',
        price: item.price || 0,
        image: item.image || ''
      };
    });

    // Handle orderDate - might be Date object or string
    let orderDateStr: string;
    if (orderPlain.orderDate instanceof Date) {
      orderDateStr = orderPlain.orderDate.toISOString();
    } else if (typeof orderPlain.orderDate === 'string') {
      orderDateStr = orderPlain.orderDate;
    } else {
      orderDateStr = new Date(orderPlain.orderDate).toISOString();
    }

    const formattedOrder = {
      orderId: orderPlain.orderId || '',
      customerName: orderPlain.customerName || '',
      phone: orderPlain.phone || '',
      address: orderPlain.address || '',
      items: formattedItems,
      subtotal: orderPlain.subtotal || 0,
      tax: orderPlain.tax || 0,
      shipping: orderPlain.shipping || 0,
      total: orderPlain.total || 0,
      orderDate: orderDateStr,
      status: orderPlain.status || 'pending',
      // Steadfast Courier fields
      steadfastConsignmentId: orderPlain.steadfastConsignmentId,
      steadfastTrackingCode: orderPlain.steadfastTrackingCode,
      steadfastStatus: orderPlain.steadfastStatus,
      steadfastSentAt: orderPlain.steadfastSentAt ? (orderPlain.steadfastSentAt instanceof Date ? orderPlain.steadfastSentAt.toISOString() : new Date(orderPlain.steadfastSentAt).toISOString()) : undefined,
      // Fraud Check fields
      fraudChecked: orderPlain.fraudChecked || false,
      fraudCheckResult: orderPlain.fraudCheckResult ? {
        ...orderPlain.fraudCheckResult,
        checkedAt: orderPlain.fraudCheckResult.checkedAt instanceof Date 
          ? orderPlain.fraudCheckResult.checkedAt.toISOString() 
          : orderPlain.fraudCheckResult.checkedAt,
      } : undefined,
      fraudCheckAt: orderPlain.fraudCheckAt ? (orderPlain.fraudCheckAt instanceof Date ? orderPlain.fraudCheckAt.toISOString() : new Date(orderPlain.fraudCheckAt).toISOString()) : undefined,
    };

    console.log('Formatted order:', { 
      orderId: formattedOrder.orderId, 
      itemsCount: formattedOrder.items.length,
      hasItems: formattedOrder.items.length > 0
    });
    
    try {
      return NextResponse.json(formattedOrder);
    } catch (jsonError: any) {
      console.error('Error serializing JSON:', jsonError);
      throw new Error(`Failed to serialize order: ${jsonError.message}`);
    }
  } catch (error: any) {
    console.error('Error in GET /api/admin/orders/[id]:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
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

    // Build query - only include _id if it's a valid ObjectId
    const query: any = { orderId: id };
    
    // Only try to match _id if the id is a valid ObjectId format
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [
        { orderId: id },
        { _id: new mongoose.Types.ObjectId(id) }
      ];
    }

    const order = await Order.findOne(query);

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
      status: order.status,
      // Steadfast Courier fields
      steadfastConsignmentId: order.steadfastConsignmentId,
      steadfastTrackingCode: order.steadfastTrackingCode,
      steadfastStatus: order.steadfastStatus,
      steadfastSentAt: order.steadfastSentAt ? order.steadfastSentAt.toISOString() : undefined,
      // Fraud Check fields
      fraudChecked: order.fraudChecked || false,
      fraudCheckResult: order.fraudCheckResult ? {
        ...order.fraudCheckResult.toObject ? order.fraudCheckResult.toObject() : order.fraudCheckResult,
        checkedAt: order.fraudCheckResult.checkedAt instanceof Date 
          ? order.fraudCheckResult.checkedAt.toISOString() 
          : order.fraudCheckResult.checkedAt,
      } : undefined,
      fraudCheckAt: order.fraudCheckAt ? order.fraudCheckAt.toISOString() : undefined,
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
