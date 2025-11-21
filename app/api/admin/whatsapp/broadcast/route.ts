import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { isModuleEnabled } from '@/lib/modules/check';
import connectDB from '@/lib/mongodb';

/**
 * POST /api/admin/whatsapp/broadcast
 * Send broadcast message to multiple recipients
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
    const { recipients, message } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const whatsappService = await WhatsAppService.getInstance();
    const result = await whatsappService.sendBroadcast(recipients, message);

    return NextResponse.json({
      ...result,
      completed: true,
    });
  } catch (error: any) {
    console.error('WhatsApp broadcast error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

