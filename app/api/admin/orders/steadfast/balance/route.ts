import { NextRequest, NextResponse } from 'next/server';
import { getSteadfastCourier } from '@/lib/steadfast';

/**
 * GET /api/admin/orders/steadfast/balance
 * Get current balance from Steadfast Courier
 */
export async function GET(request: NextRequest) {
  try {
    const steadfast = await getSteadfastCourier();
    const balanceResponse = await steadfast.getBalance();

    return NextResponse.json({
      success: true,
      currentBalance: balanceResponse.current_balance,
    });
  } catch (error: any) {
    console.error('Error getting Steadfast balance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get balance',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

