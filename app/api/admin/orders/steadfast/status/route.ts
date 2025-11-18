import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSteadfastCourier } from '@/lib/steadfast';

/**
 * POST /api/admin/orders/steadfast/status
 * Check delivery status of an order from Steadfast Courier
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.steadfastConsignmentId && !order.steadfastTrackingCode) {
      return NextResponse.json(
        { error: 'Order has not been sent to Steadfast Courier yet' },
        { status: 400 }
      );
    }

    // Get Steadfast Courier instance with settings
    const steadfast = await getSteadfastCourier();
    
    let statusResponse;

    // Try to get status by consignment ID first, then tracking code
    if (order.steadfastConsignmentId) {
      statusResponse = await steadfast.getStatusByConsignmentId(order.steadfastConsignmentId);
    } else if (order.steadfastTrackingCode) {
      statusResponse = await steadfast.getStatusByTrackingCode(order.steadfastTrackingCode);
    } else {
      // Fallback to invoice
      statusResponse = await steadfast.getStatusByInvoice(order.orderId);
    }

    // Update order status
    order.steadfastStatus = statusResponse.delivery_status;
    await order.save();

    return NextResponse.json({
      success: true,
      deliveryStatus: statusResponse.delivery_status,
      orderId: order.orderId,
      trackingCode: order.steadfastTrackingCode,
      consignmentId: order.steadfastConsignmentId,
    });
  } catch (error: any) {
    console.error('Error checking Steadfast status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check delivery status',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

