/**
 * Fraud Check API Integration
 * Endpoint: https://bdcourier.com/api/courier-check
 */

const BASE_URL = 'https://bdcourier.com/api/courier-check';

interface FraudCheckConfig {
  apiKey: string;
}

interface FraudCheckResponse {
  success?: boolean;
  data?: {
    phone?: string;
    total_orders?: number;
    successful_orders?: number;
    failed_orders?: number;
    success_ratio?: number;
    fraud_score?: number;
    status?: string;
    last_order_date?: string;
    risk_level?: 'low' | 'medium' | 'high';
    courierData?: {
      [key: string]: {
        name?: string;
        logo?: string;
        total_parcel: number;
        success_parcel: number;
        cancelled_parcel: number;
        success_ratio: number;
      };
    };
    summary?: {
      total_parcel: number;
      success_parcel: number;
      cancelled_parcel: number;
      success_ratio: number;
    };
  };
  error?: string;
  message?: string;
}

export class FraudCheckService {
  private apiKey: string;

  constructor(config: FraudCheckConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Check fraud status for a phone number
   */
  async checkFraud(phone: string): Promise<FraudCheckResponse> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Failed to check fraud status',
          message: data.message,
        };
      }

      // Handle new response format with status and courierData at root level
      if (data.status === 'success' && data.courierData) {
        return {
          success: true,
          data: {
            ...data,
            courierData: data.courierData,
            summary: data.courierData.summary || data.summary,
          },
        };
      }

      // Fallback to old format
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      console.error('Fraud check API error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Create an instance with specific API key
   */
  static withCredentials(apiKey: string): FraudCheckService {
    return new FraudCheckService({ apiKey });
  }
}

/**
 * Get FraudCheckService instance with credentials from database settings
 * Falls back to environment variable if settings not available
 */
export async function getFraudCheckService(): Promise<FraudCheckService> {
  try {
    // Try to get from database settings
    const SettingsModule = await import('@/models/Settings');
    const Settings = SettingsModule.default;
    const connectDB = (await import('@/lib/mongodb')).default;
    await connectDB();

    const settings = await Settings.findOne({ _singleton: true }).lean() as {
      fraudCheckApiKey?: string;
      [key: string]: any;
    } | null;

    if (settings?.fraudCheckApiKey) {
      return FraudCheckService.withCredentials(settings.fraudCheckApiKey);
    }
  } catch (error) {
    console.error('Error fetching fraud check API key from settings:', error);
  }

  // Fallback to environment variable
  const apiKey = process.env.FRAUD_CHECK_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Fraud Check API key not configured. Please set it in admin settings or FRAUD_CHECK_API_KEY environment variable.'
    );
  }

  return FraudCheckService.withCredentials(apiKey);
}



