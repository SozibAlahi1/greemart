/**
 * Steadfast Courier API Integration
 * Base URL: https://portal.packzy.com/api/v1
 */

const BASE_URL = 'https://portal.packzy.com/api/v1';

interface SteadfastConfig {
  apiKey: string;
  secretKey: string;
}

interface CreateOrderParams {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  alternative_phone?: string;
  recipient_email?: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
  total_lot?: number;
  delivery_type?: 0 | 1; // 0 = home delivery, 1 = Point Delivery/Steadfast Hub Pick Up
}

interface CreateOrderResponse {
  status: number;
  message: string;
  consignment: {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string;
    note?: string;
    created_at: string;
    updated_at: string;
  };
}

interface DeliveryStatusResponse {
  status: number;
  delivery_status: string;
}

interface BalanceResponse {
  status: number;
  current_balance: number;
}

class SteadfastCourier {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey?: string, secretKey?: string) {
    // Use provided credentials or fall back to environment variables
    this.apiKey = apiKey || process.env.STEADFAST_API_KEY || '';
    this.secretKey = secretKey || process.env.STEADFAST_SECRET_KEY || '';
  }

  private getHeaders() {
    return {
      'Api-Key': this.apiKey,
      'Secret-Key': this.secretKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a new instance with custom credentials
   */
  static withCredentials(apiKey: string, secretKey: string): SteadfastCourier {
    return new SteadfastCourier(apiKey, secretKey);
  }

  /**
   * Create a single order in Steadfast Courier
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Steadfast API credentials are not configured. Please set STEADFAST_API_KEY and STEADFAST_SECRET_KEY in your environment variables.');
    }

    try {
      const response = await fetch(`${BASE_URL}/create_order`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order in Steadfast Courier');
      }

      return data;
    } catch (error: any) {
      console.error('Steadfast API Error:', error);
      throw new Error(error.message || 'Failed to create order in Steadfast Courier');
    }
  }

  /**
   * Create bulk orders in Steadfast Courier
   */
  async createBulkOrders(orders: CreateOrderParams[]): Promise<any[]> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Steadfast API credentials are not configured. Please set STEADFAST_API_KEY and STEADFAST_SECRET_KEY in your environment variables.');
    }

    if (orders.length > 500) {
      throw new Error('Maximum 500 orders are allowed per bulk request');
    }

    try {
      const response = await fetch(`${BASE_URL}/create_order/bulk-order`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          data: JSON.stringify(orders),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create bulk orders in Steadfast Courier');
      }

      return data.data || [];
    } catch (error: any) {
      console.error('Steadfast Bulk API Error:', error);
      throw new Error(error.message || 'Failed to create bulk orders in Steadfast Courier');
    }
  }

  /**
   * Check delivery status by consignment ID
   */
  async getStatusByConsignmentId(consignmentId: number): Promise<DeliveryStatusResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Steadfast API credentials are not configured.');
    }

    try {
      const response = await fetch(`${BASE_URL}/status_by_cid/${consignmentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get delivery status');
      }

      return data;
    } catch (error: any) {
      console.error('Steadfast Status API Error:', error);
      throw new Error(error.message || 'Failed to get delivery status');
    }
  }

  /**
   * Check delivery status by invoice ID
   */
  async getStatusByInvoice(invoice: string): Promise<DeliveryStatusResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Steadfast API credentials are not configured.');
    }

    try {
      const response = await fetch(`${BASE_URL}/status_by_invoice/${encodeURIComponent(invoice)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get delivery status');
      }

      return data;
    } catch (error: any) {
      console.error('Steadfast Status API Error:', error);
      throw new Error(error.message || 'Failed to get delivery status');
    }
  }

  /**
   * Check delivery status by tracking code
   */
  async getStatusByTrackingCode(trackingCode: string): Promise<DeliveryStatusResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Steadfast API credentials are not configured.');
    }

    try {
      const response = await fetch(`${BASE_URL}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get delivery status');
      }

      return data;
    } catch (error: any) {
      console.error('Steadfast Status API Error:', error);
      throw new Error(error.message || 'Failed to get delivery status');
    }
  }

  /**
   * Get current balance
   */
  async getBalance(): Promise<BalanceResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Steadfast API credentials are not configured.');
    }

    try {
      const response = await fetch(`${BASE_URL}/get_balance`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get balance');
      }

      return data;
    } catch (error: any) {
      console.error('Steadfast Balance API Error:', error);
      throw new Error(error.message || 'Failed to get balance');
    }
  }
}

// Default instance (uses environment variables if available)
export const steadfastCourier = new SteadfastCourier();

// Helper function to get Steadfast instance with settings
export async function getSteadfastCourier(): Promise<SteadfastCourier> {
  // Import Settings dynamically to avoid circular dependencies
  const Settings = (await import('@/models/Settings')).default;
  const connectDB = (await import('@/lib/mongodb')).default;
  
  await connectDB();
  const settings = await Settings.findOne({ _singleton: true });
  
  if (settings?.steadfastApiKey && settings?.steadfastSecretKey) {
    return SteadfastCourier.withCredentials(settings.steadfastApiKey, settings.steadfastSecretKey);
  }
  
  // Fall back to default instance (environment variables)
  return steadfastCourier;
}

export type { CreateOrderParams, CreateOrderResponse, DeliveryStatusResponse, BalanceResponse };

