import { NextRequest, NextResponse } from 'next/server';
import { getTrackingAnalytics } from '@/lib/tracking';

/**
 * GET /api/admin/tracking/analytics
 * Get tracking analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType') || undefined;

    const analytics = await getTrackingAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventType,
    });

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking analytics', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}

