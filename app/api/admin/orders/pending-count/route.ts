import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * GET /api/admin/orders/pending-count
 * Get count of pending orders
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Count orders with status 'pending'
    const pendingCount = await Order.countDocuments({ status: 'pending' });
    
    return NextResponse.json({
      success: true,
      count: pendingCount,
    });
  } catch (error: any) {
    console.error('Error getting pending orders count:', error);
    return NextResponse.json(
      {
        error: 'Failed to get pending orders count',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}


