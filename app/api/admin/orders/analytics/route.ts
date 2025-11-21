import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { OrderLean, OrderItemLean } from '@/models/Order';

interface DailyPoint {
  date: string;
  orders: number;
  revenue: number;
}

interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

/**
 * GET /api/admin/orders/analytics
 * Returns analytics data for the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get('days') || 30);
    const limitTopProducts = Number(searchParams.get('top') || 5);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      orderDate: { $gte: startDate },
    })
      .sort({ orderDate: 1 })
      .lean<OrderLean[]>();

    const dailyMap = new Map<string, DailyPoint>();
    const statusCounts: Record<string, number> = {};
    const productMap = new Map<string, TopProduct>();
    let totalRevenue = 0;

    orders.forEach((order) => {
      const date = new Date(order.orderDate);
      const dateKey = date.toISOString().split('T')[0];

      const revenue = order.total || 0;
      totalRevenue += revenue;

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          orders: 0,
          revenue: 0,
        });
      }

      const dailyPoint = dailyMap.get(dateKey)!;
      dailyPoint.orders += 1;
      dailyPoint.revenue += revenue;

      const status = order.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      order.items?.forEach((item: OrderItemLean) => {
        const productId =
          typeof item.productId === 'string'
            ? item.productId
            : item.productId && 'toString' in item.productId
            ? item.productId.toString()
            : String(item.productId);

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            name: item.name,
            quantity: 0,
            revenue: 0,
          });
        }

        const product = productMap.get(productId)!;
        product.quantity += item.quantity;
        product.revenue += item.price * item.quantity;
      });
    });

    const dailyOrders: DailyPoint[] = [];
    const dayIterator = new Date(startDate);
    while (dayIterator <= endDate) {
      const key = dayIterator.toISOString().split('T')[0];
      dailyOrders.push(
        dailyMap.get(key) || {
          date: key,
          orders: 0,
          revenue: 0,
        }
      );
      dayIterator.setDate(dayIterator.getDate() + 1);
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limitTopProducts);

    const avgOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue,
      },
      dailyOrders,
      statusCounts,
      topProducts,
    });
  } catch (error: any) {
    console.error('Error fetching order analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}





