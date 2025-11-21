import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getFraudCheckService } from '@/lib/fraudCheck';

const parseNumericValue = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const cleaned = value.trim().replace(/[^\d.-]/g, '');
    if (!cleaned) return undefined;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseIntegerValue = (value: unknown): number | undefined => {
  const parsed = parseNumericValue(value);
  if (parsed === undefined) return undefined;
  return Math.round(parsed);
};

const normalizeSuccessRatio = (value: unknown): number | undefined => {
  const parsed = parseNumericValue(value);
  if (parsed === undefined) return undefined;
  if (parsed >= 0 && parsed <= 1) {
    return parsed * 100;
  }
  return parsed;
};

/**
 * POST /api/admin/orders/fraud-check
 * Check fraud status for an order
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

    // Get fraud check service
    const fraudCheckService = await getFraudCheckService();
    
    // Check fraud status
    const fraudResult = await fraudCheckService.checkFraud(order.phone);

    // Update order with fraud check result
    if (fraudResult.success && fraudResult.data) {
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

      order.fraudChecked = true;
      order.fraudCheckResult = {
        success: true,
        totalOrders: totalOrders,
        successfulOrders: successfulOrders,
        failedOrders: failedOrders,
        successRatio: successRatio,
        fraudScore: fraudScore,
        riskLevel: riskLevel,
        status: data.status || (data as any).status,
        lastOrderDate: data.last_order_date,
        courierData: courierData || undefined,
        summary: summary ? {
          total_parcel: summary.total_parcel || 0,
          success_parcel: summary.success_parcel || 0,
          cancelled_parcel: summary.cancelled_parcel || 0,
          success_ratio: summary.success_ratio || 0,
        } : undefined,
        checkedAt: new Date(),
      };
      order.fraudCheckAt = new Date();
    } else {
      // Store error result
      order.fraudChecked = true;
      order.fraudCheckResult = {
        success: false,
        checkedAt: new Date(),
      };
      order.fraudCheckAt = new Date();
    }

    await order.save();

    return NextResponse.json({
      success: true,
      fraudChecked: order.fraudChecked,
      result: order.fraudCheckResult,
      error: fraudResult.error,
    });
  } catch (error: any) {
    console.error('Error checking fraud:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check fraud status',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

