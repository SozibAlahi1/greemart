/**
 * Server-side tracking utilities
 * Use these functions to track events from server components or API routes
 */

import connectDB from '@/lib/mongodb';
import Tracking, { ITracking } from '@/models/Tracking';

export interface TrackEventParams {
  eventType: 'page_view' | 'click' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'search' | 'custom';
  eventName: string;
  sessionId?: string;
  userId?: string;
  page?: string;
  referrer?: string;
  metadata?: Record<string, any>;
  productId?: string;
  productName?: string;
  orderId?: string;
  orderTotal?: number;
  searchQuery?: string;
  searchResults?: number;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
}

/**
 * Track an event server-side
 * This function can be called from API routes or server components
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    await connectDB();

    const trackingData: Partial<ITracking> = {
      eventType: params.eventType,
      eventName: params.eventName,
      sessionId: params.sessionId,
      userId: params.userId,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      page: params.page,
      referrer: params.referrer,
      metadata: params.metadata || {},
      productId: params.productId,
      productName: params.productName,
      orderId: params.orderId,
      orderTotal: params.orderTotal,
      searchQuery: params.searchQuery,
      searchResults: params.searchResults,
      deviceType: params.deviceType,
      browser: params.browser,
      os: params.os,
      country: params.country,
      city: params.city,
      timestamp: new Date(),
    };

    await Tracking.create(trackingData);
  } catch (error) {
    // Silently fail tracking to not break the main flow
    console.error('Error tracking event:', error);
  }
}

/**
 * Track a page view
 */
export async function trackPageView(
  page: string,
  options?: {
    sessionId?: string;
    userId?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<void> {
  await trackEvent({
    eventType: 'page_view',
    eventName: `page_view_${page.replace(/\//g, '_').replace(/^_/, '') || 'home'}`,
    page,
    ...options,
  });
}

/**
 * Track a purchase
 */
export async function trackPurchase(
  orderId: string,
  orderTotal: number,
  options?: {
    sessionId?: string;
    userId?: string;
    productId?: string;
    productName?: string;
    metadata?: Record<string, any>;
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<void> {
  await trackEvent({
    eventType: 'purchase',
    eventName: 'purchase_complete',
    orderId,
    orderTotal,
    ...options,
  });
}

/**
 * Track a product view
 */
export async function trackProductView(
  productId: string,
  productName: string,
  options?: {
    sessionId?: string;
    userId?: string;
    page?: string;
  }
): Promise<void> {
  await trackEvent({
    eventType: 'click',
    eventName: 'product_view',
    productId,
    productName,
    ...options,
  });
}

/**
 * Track a search query
 */
export async function trackSearch(
  searchQuery: string,
  searchResults: number,
  options?: {
    sessionId?: string;
    userId?: string;
    page?: string;
  }
): Promise<void> {
  await trackEvent({
    eventType: 'search',
    eventName: 'search_query',
    searchQuery,
    searchResults,
    ...options,
  });
}

/**
 * Get tracking analytics
 */
export async function getTrackingAnalytics(options?: {
  startDate?: Date;
  endDate?: Date;
  eventType?: string;
}): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByPage: Record<string, number>;
  topPages: Array<{ page: string; count: number }>;
  topEvents: Array<{ eventName: string; count: number }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  dailyEvents: Array<{ date: string; count: number }>;
}> {
  try {
    await connectDB();

    const query: any = {};
    if (options?.startDate || options?.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate;
      }
    }
    if (options?.eventType) {
      query.eventType = options.eventType;
    }

    const events = await Tracking.find(query).lean();

    const totalEvents = events.length;
    const eventsByType: Record<string, number> = {};
    const eventsByPage: Record<string, number> = {};
    const deviceBreakdown: Record<string, number> = {};
    const browserBreakdown: Record<string, number> = {};
    const eventNameCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    events.forEach((event: any) => {
      // Count by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      // Count by page
      if (event.page) {
        eventsByPage[event.page] = (eventsByPage[event.page] || 0) + 1;
      }

      // Count by device
      if (event.deviceType) {
        deviceBreakdown[event.deviceType] = (deviceBreakdown[event.deviceType] || 0) + 1;
      }

      // Count by browser
      if (event.browser) {
        browserBreakdown[event.browser] = (browserBreakdown[event.browser] || 0) + 1;
      }

      // Count by event name
      eventNameCounts[event.eventName] = (eventNameCounts[event.eventName] || 0) + 1;

      // Count by day
      const dateKey = new Date(event.timestamp).toISOString().split('T')[0];
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    });

    // Get top pages
    const topPages = Object.entries(eventsByPage)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top events
    const topEvents = Object.entries(eventNameCounts)
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get daily events
    const dailyEvents = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalEvents,
      eventsByType,
      eventsByPage,
      topPages,
      topEvents,
      deviceBreakdown,
      browserBreakdown,
      dailyEvents,
    };
  } catch (error) {
    console.error('Error getting tracking analytics:', error);
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByPage: {},
      topPages: [],
      topEvents: [],
      deviceBreakdown: {},
      browserBreakdown: {},
      dailyEvents: [],
    };
  }
}

