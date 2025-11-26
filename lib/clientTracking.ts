/**
 * Client-side tracking utilities
 * Use these functions to track events from client components
 */

import { getSessionId } from './session';

export interface TrackEventParams {
  eventType: 'page_view' | 'click' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'search' | 'custom';
  eventName: string;
  page?: string;
  referrer?: string;
  metadata?: Record<string, any>;
  productId?: string;
  productName?: string;
  orderId?: string;
  orderTotal?: number;
  searchQuery?: string;
  searchResults?: number;
}

/**
 * Track an event from the client
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    await fetch('/api/tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        sessionId,
        page: params.page || window.location.pathname,
        referrer: params.referrer || document.referrer,
      }),
    });
  } catch (error) {
    // Silently fail tracking to not break the main flow
    console.error('Error tracking event:', error);
  }
}

/**
 * Track a page view
 */
export function trackPageView(page?: string): void {
  trackEvent({
    eventType: 'page_view',
    eventName: `page_view_${(page || window.location.pathname).replace(/\//g, '_').replace(/^_/, '') || 'home'}`,
    page: page || window.location.pathname,
  });
}

/**
 * Track a product view
 */
export function trackProductView(productId: string, productName: string): void {
  trackEvent({
    eventType: 'click',
    eventName: 'product_view',
    productId,
    productName,
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(productId: string, productName: string, quantity: number, price: number): void {
  trackEvent({
    eventType: 'add_to_cart',
    eventName: 'add_to_cart',
    productId,
    productName,
    metadata: {
      quantity,
      price,
    },
  });
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(productId: string, productName: string): void {
  trackEvent({
    eventType: 'remove_from_cart',
    eventName: 'remove_from_cart',
    productId,
    productName,
  });
}

/**
 * Track a search query
 */
export function trackSearch(searchQuery: string, searchResults: number): void {
  trackEvent({
    eventType: 'search',
    eventName: 'search_query',
    searchQuery,
    searchResults,
  });
}

