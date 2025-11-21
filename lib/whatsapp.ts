/**
 * WhatsApp Marketing API Integration
 * Handles sending messages, cart recovery, notifications, and broadcasts
 */

interface WhatsAppConfig {
  apiKey: string;
  apiUrl?: string;
  phoneNumberId?: string;
}

interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., 8801712345678)
  message: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private apiKey: string;
  private apiUrl: string;
  private phoneNumberId?: string;

  constructor(config: WhatsAppConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || 'https://graph.facebook.com/v18.0';
    this.phoneNumberId = config.phoneNumberId;
  }

  /**
   * Send a text message to a phone number
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      const url = this.phoneNumberId 
        ? `${this.apiUrl}/${this.phoneNumberId}/messages`
        : `${this.apiUrl}/messages`;

      const payload: any = {
        messaging_product: 'whatsapp',
        to: message.to,
        type: message.type || 'text',
      };

      if (message.type === 'template' && message.templateName) {
        payload.template = {
          name: message.templateName,
          language: { code: 'en' },
        };
        if (message.templateParams && message.templateParams.length > 0) {
          payload.template.components = [
            {
              type: 'body',
              parameters: message.templateParams.map(param => ({
                type: 'text',
                text: param,
              })),
            },
          ];
        }
      } else {
        payload.text = { body: message.message };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp message',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error: any) {
      console.error('WhatsApp API error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Send cart recovery message
   */
  async sendCartRecovery(phone: string, cartItems: Array<{ name: string; quantity: number; price: number }>): Promise<WhatsAppResponse> {
    const itemsList = cartItems.map(item => `${item.name} (x${item.quantity})`).join('\n');
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const message = `🛒 Cart Recovery Reminder\n\nYou have items in your cart:\n${itemsList}\n\nTotal: ৳${total.toFixed(2)}\n\nComplete your purchase now: [Your Store Link]`;
    
    return this.sendMessage({
      to: phone,
      message,
    });
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(phone: string, orderId: string, status: string, total: number): Promise<WhatsAppResponse> {
    const message = `📦 Order Update\n\nOrder ID: ${orderId}\nStatus: ${status}\nTotal: ৳${total.toFixed(2)}\n\nThank you for your purchase!`;
    
    return this.sendMessage({
      to: phone,
      message,
    });
  }

  /**
   * Send broadcast message to multiple recipients
   */
  async sendBroadcast(recipients: string[], message: string): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      const result = await this.sendMessage({
        to: recipient,
        message,
      });

      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(`${recipient}: ${result.error || 'Unknown error'}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { success, failed, errors };
  }

  /**
   * Create an instance with credentials from database settings
   */
  static async getInstance(): Promise<WhatsAppService> {
    try {
      const Settings = (await import('@/models/Settings')).default;
      const connectDB = (await import('@/lib/mongodb')).default;
      await connectDB();

      const settings = await Settings.findOne({ _singleton: true }).lean() as {
        whatsappApiKey?: string;
        whatsappApiUrl?: string;
        whatsappPhoneNumberId?: string;
        [key: string]: any;
      } | null;

      if (settings?.whatsappApiKey) {
        return new WhatsAppService({
          apiKey: settings.whatsappApiKey,
          apiUrl: settings.whatsappApiUrl,
          phoneNumberId: settings.whatsappPhoneNumberId,
        });
      }
    } catch (error) {
      console.error('Error fetching WhatsApp API key from settings:', error);
    }

    // Fallback to environment variable
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey) {
      throw new Error(
        'WhatsApp API key not configured. Please set it in admin settings or WHATSAPP_API_KEY environment variable.'
      );
    }

    return new WhatsAppService({
      apiKey,
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    });
  }
}

