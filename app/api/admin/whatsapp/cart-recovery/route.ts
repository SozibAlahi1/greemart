import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { isModuleEnabled } from '@/lib/modules/check';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * POST /api/admin/whatsapp/cart-recovery
 * Send cart recovery message to a customer
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
    const { phone, cartItems } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    const whatsappService = await WhatsAppService.getInstance();
    const result = await whatsappService.sendCartRecovery(phone, cartItems);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send cart recovery message' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('WhatsApp cart recovery error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

