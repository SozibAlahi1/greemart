import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp';
import { isModuleEnabled } from '@/lib/modules/check';
import connectDB from '@/lib/mongodb';

/**
 * POST /api/admin/whatsapp/send
 * Send a WhatsApp message
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
    const { to, message, type, templateName, templateParams } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const whatsappService = await WhatsAppService.getInstance();
    const result = await whatsappService.sendMessage({
      to,
      message,
      type,
      templateName,
      templateParams,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

