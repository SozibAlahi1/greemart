import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSteadfastCourier } from '@/lib/steadfast';

/**
 * POST /api/admin/orders/steadfast/send
 * Send an order to Steadfast Courier
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { orderId, deliveryType = 0 } = body; // deliveryType: 0 = home delivery, 1 = Point Delivery

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

    // Check if already sent to Steadfast
    if (order.steadfastConsignmentId) {
      return NextResponse.json(
        { 
          error: 'Order already sent to Steadfast Courier',
          consignmentId: order.steadfastConsignmentId,
          trackingCode: order.steadfastTrackingCode
        },
        { status: 400 }
      );
    }

    // Prepare order data for Steadfast
    const itemDescription = order.items
      .map(item => `${item.name} (Qty: ${item.quantity})`)
      .join(', ');

    const steadfastOrder = {
      invoice: order.orderId,
      recipient_name: order.customerName,
      recipient_phone: order.phone,
      recipient_address: order.address,
      cod_amount: order.total,
      note: `Order from grocery store. Total items: ${order.items.length}`,
      item_description: itemDescription,
      total_lot: order.items.length,
      delivery_type: deliveryType as 0 | 1,
    };

    // Get Steadfast Courier instance with settings
    const steadfast = await getSteadfastCourier();
    
    // Send to Steadfast Courier
    const response = await steadfast.createOrder(steadfastOrder);

    // Update order with Steadfast information
    order.steadfastConsignmentId = response.consignment.consignment_id;
    order.steadfastTrackingCode = response.consignment.tracking_code;
    order.steadfastStatus = response.consignment.status;
    order.steadfastSentAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order sent to Steadfast Courier successfully',
      consignment: {
        consignmentId: response.consignment.consignment_id,
        trackingCode: response.consignment.tracking_code,
        status: response.consignment.status,
      },
    });
  } catch (error: any) {
    console.error('Error sending order to Steadfast:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send order to Steadfast Courier',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

