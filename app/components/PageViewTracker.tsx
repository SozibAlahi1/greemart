'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/clientTracking';

/**
 * Component to automatically track page views
 * Add this to your root layout or ConditionalLayout
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

