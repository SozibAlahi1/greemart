import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tracking, { ITracking } from '@/models/Tracking';
import { trackEvent } from '@/lib/tracking';

/**
 * POST /api/tracking
 * Track an event from the client or server
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      eventType,
      eventName,
      sessionId,
      userId,
      page,
      referrer,
      metadata,
      productId,
      productName,
      orderId,
      orderTotal,
      searchQuery,
      searchResults,
    } = body;

    // Validate required fields
    if (!eventType || !eventName) {
      return NextResponse.json(
        { error: 'eventType and eventName are required' },
        { status: 400 }
      );
    }

    // Get client information from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const referer = referrer || request.headers.get('referer') || undefined;

    // Parse user agent to extract device/browser info
    const deviceInfo = parseUserAgent(userAgent);

    // Create tracking event
    const trackingData: Partial<ITracking> = {
      eventType,
      eventName,
      sessionId,
      userId,
      userAgent,
      ipAddress,
      page: page || new URL(request.url).pathname,
      referrer: referer,
      metadata: metadata || {},
      productId,
      productName,
      orderId,
      orderTotal,
      searchQuery,
      searchResults,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      timestamp: new Date(),
    };

    const tracking = await Tracking.create(trackingData);

    return NextResponse.json({
      success: true,
      id: tracking._id,
    });
  } catch (error: any) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tracking
 * Get tracking events (admin only - add auth check in production)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const page = searchParams.get('page');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    const query: any = {};

    if (eventType) {
      query.eventType = eventType;
    }

    if (page) {
      query.page = page;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const events = await Tracking.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Tracking.countDocuments(query);

    return NextResponse.json({
      events,
      total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error('Error fetching tracking events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking events', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}

/**
 * Helper function to parse user agent string
 */
function parseUserAgent(userAgent?: string): {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
} {
  if (!userAgent) {
    return { deviceType: 'desktop', browser: 'Unknown', os: 'Unknown' };
  }

  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  }

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  return { deviceType, browser, os };
}

