import { NextRequest, NextResponse } from 'next/server';
import { getFraudCheckService } from '@/lib/fraudCheck';
import connectDB from '@/lib/mongodb';

/**
 * Helper function to parse numeric values from API response
 */
function parseNumericValue(value: any): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

/**
 * Helper function to parse integer values from API response
 */
function parseIntegerValue(value: any): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'string' ? parseInt(value, 10) : Math.floor(Number(value));
  return Number.isFinite(num) ? num : undefined;
}

/**
 * Normalize success ratio to percentage (0-100)
 */
function normalizeSuccessRatio(value: any): number | undefined {
  const num = parseNumericValue(value);
  if (num === undefined) return undefined;
  // If value is already in 0-100 range, return as is
  if (num >= 0 && num <= 100) return num;
  // If value is in 0-1 range, convert to percentage
  if (num >= 0 && num <= 1) return num * 100;
  // Otherwise, assume it's already a percentage but might be > 100, cap at 100
  return Math.min(100, Math.max(0, num));
}

/**
 * POST /api/admin/fraud-check
 * Check fraud status for a phone number
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Get fraud check service
    const fraudCheckService = await getFraudCheckService();
    
    // Check fraud status
    const fraudResult = await fraudCheckService.checkFraud(phone);

    if (!fraudResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: fraudResult.error || 'Failed to check fraud status',
          message: fraudResult.message,
        },
        { status: 400 }
      );
    }

    if (!fraudResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'No data returned from fraud check service',
        },
        { status: 500 }
      );
    }

    const data = fraudResult.data;

    // Handle new response format with courierData
    let courierData = (data as any).courierData;
    let summary = (data as any).summary || (data as any).courierData?.summary;

    // Extract summary data if available
    let successRatioValue: number | undefined;
    let totalOrders: number | undefined;
    let successfulOrders: number | undefined;
    let failedOrders: number | undefined;

    if (summary) {
      // Use summary data from courierData
      successRatioValue = normalizeSuccessRatio(summary.success_ratio);
      totalOrders = parseIntegerValue(summary.total_parcel);
      successfulOrders = parseIntegerValue(summary.success_parcel);
      failedOrders = parseIntegerValue(summary.cancelled_parcel);
    } else {
      // Fallback to old format
      successRatioValue = normalizeSuccessRatio(
        data.success_ratio ?? (data as any).successRatio
      );
      totalOrders = parseIntegerValue(data.total_orders ?? (data as any).totalOrders);
      successfulOrders = parseIntegerValue(data.successful_orders ?? (data as any).successfulOrders);
      failedOrders = parseIntegerValue(data.failed_orders ?? (data as any).failedOrders);
    }

    const fraudScore = parseNumericValue(data.fraud_score ?? (data as any).fraudScore);
    const successRatio = successRatioValue ?? 0;

    // Calculate risk level based on success ratio
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (successRatio < 50) {
      riskLevel = 'high';
    } else if (successRatio < 75) {
      riskLevel = 'medium';
    }

    // Clean courierData - remove summary from it if present
    if (courierData && courierData.summary) {
      const { summary: _, ...couriers } = courierData;
      courierData = couriers;
    }

    // Return formatted response
    return NextResponse.json({
      success: true,
      result: {
        success: true,
        phone: phone,
        riskLevel,
        successRatio,
        totalOrders,
        successfulOrders,
        failedOrders,
        fraudScore,
        status: data.status || (data as any).status || 'checked',
        lastOrderDate: data.last_order_date || (data as any).lastOrderDate,
        checkedAt: new Date().toISOString(),
        courierData: courierData || undefined,
        summary: summary || {
          total_parcel: totalOrders || 0,
          success_parcel: successfulOrders || 0,
          cancelled_parcel: failedOrders || 0,
          success_ratio: successRatio,
        },
      },
    });
  } catch (error: any) {
    console.error('Fraud check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

