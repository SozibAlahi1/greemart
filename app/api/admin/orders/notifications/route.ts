import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * GET /api/admin/orders/notifications
 * Get recent pending orders for notifications
 * Query params: limit (default: 10), since (ISO date string for filtering)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const since = searchParams.get('since'); // ISO date string
    
    // Build query
    const query: any = { status: 'pending' };
    
    // If 'since' is provided, only get orders created after that date
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }
    
    // Get recent pending orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderId customerName phone total createdAt status')
      .lean();
    
    const notifications = orders.map((order) => ({
      orderId: order.orderId,
      customerName: order.customerName,
      phone: order.phone,
      total: order.total,
      createdAt: order.createdAt instanceof Date 
        ? order.createdAt.toISOString() 
        : new Date(order.createdAt).toISOString(),
      status: order.status,
    }));
    
    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      {
        error: 'Failed to get notifications',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}


