import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { isModuleEnabled } from '@/lib/modules/check';
import connectDB from '@/lib/mongodb';
import Order, { OrderLean } from '@/models/Order';

/**
 * POST /api/admin/whatsapp/order-notification
 * Send order notification to customer
 */
export async function POST(request: NextRequest) {
  try {
    // Check if module is enabled
    await connectDB();
    const enabled = await isModuleEnabled('whatsapp-marketing');
    if (!enabled) {
      return NextResponse.json(
        { error: 'WhatsApp Marketing module is not enabled' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderId }).lean() as OrderLean | null;
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const whatsappService = await WhatsAppService.getInstance();
    const result = await whatsappService.sendOrderNotification(
      order.phone,
      order.orderId,
      order.status || 'pending',
      order.total
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send order notification' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('WhatsApp order notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

