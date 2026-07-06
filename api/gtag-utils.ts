/**
 * Google Ads Conversion Tracking Utility
 * Provides a type-safe wrapper around the global gtag function for tracking conversions
 * Conversion ID: AW-17824333319
 */

const GOOGLE_ADS_ID = 'AW-17824333319';
const REQUEST_QUOTE_CONVERSION_SEND_TO = 'AW-17824333319/Tqz6CM_jnZAcEIf8prNC';
const EVENT_DEDUPE_WINDOW_MS = 1200;
const recentEventMap = new Map<string, number>();

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    google_tag_manager?: Record<string, any>;
  }
}

const hasGtmContainer = (): boolean => {
  if (typeof window === 'undefined') return false;

  const hasGtmScript = Boolean(
    document.querySelector('script[src*="googletagmanager.com/gtm.js?id=GTM-"]')
  );

  const hasGtmRuntime =
    !!window.google_tag_manager &&
    Object.keys(window.google_tag_manager).some((key) => key.startsWith('GTM-'));

  const hasGtmBootstrapEvent =
    Array.isArray(window.dataLayer) &&
    window.dataLayer.some((entry) => entry && typeof entry === 'object' && 'gtm.start' in entry);

  return hasGtmScript || hasGtmRuntime || hasGtmBootstrapEvent;
};

const shouldDeduplicate = (eventName: string, payload?: Record<string, any>): boolean => {
  const dedupeKey = `${eventName}|${payload?.page_path || ''}|${payload?.phone_number || ''}|${payload?.link_text || ''}|${payload?.service_context || ''}`;
  const now = Date.now();
  const prev = recentEventMap.get(dedupeKey) || 0;
  recentEventMap.set(dedupeKey, now);
  return now - prev < EVENT_DEDUPE_WINDOW_MS;
};

export const inferServiceContext = (pagePath: string): string => {
  const path = (pagePath || '').toLowerCase();
  if (!path || path === '/') return 'homepage';
  if (path.includes('instant-estimate')) return 'instant_estimate';
  if (path.includes('grease-trap') || path.includes('interceptor')) return 'grease_service';
  if (path.includes('hydro-jetting')) return 'hydro_jetting';
  if (path.includes('used-cooking-oil') || path.includes('uco')) return 'uco_pickup';
  if (path.includes('restaurant-waste-services')) return 'restaurant_waste_services';
  if (path.includes('goslyn')) return 'goslyn_consultation';
  if (path.includes('faq')) return 'faq';
  return 'general';
};

/**
 * Tracks lead-intent events using GTM dataLayer when a GTM container exists,
 * otherwise falls back to direct GA4 gtag event calls.
 */
export function trackLeadEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  if (shouldDeduplicate(eventName, eventData)) return;

  const payload = {
    event: eventName,
    ...(eventData || {}),
  };

  try {
    if (hasGtmContainer() && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
      if (import.meta.env.DEV) {
        console.log(`\u2713 dataLayer event pushed: ${eventName}`, payload);
      }
      return;
    }

    if (window.gtag) {
      window.gtag('event', eventName, eventData || {});
      if (import.meta.env.DEV) {
        console.log(`\u2713 gtag lead event tracked: ${eventName}`, payload);
      }
      return;
    }

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
      if (import.meta.env.DEV) {
        console.log(`\u2713 dataLayer fallback push: ${eventName}`, payload);
      }
      return;
    }

    console.warn(`No analytics transport available for event: ${eventName}`);
  } catch (error) {
    console.error(`Error tracking lead event ${eventName}:`, error);
  }
}

/**
 * Track a conversion event for Google Ads
 * @param conversionData - Contact and estimate data to pass as event parameters
 */
export function trackConversion(conversionData?: {
  phone?: string;
  email?: string;
  service?: string;
  estimateId?: string;
  [key: string]: any;
}) {
  if (!window.gtag) {
    console.warn('gtag not initialized - conversion not tracked');
    return;
  }

  try {
    window.gtag('event', 'conversion', {
      send_to: REQUEST_QUOTE_CONVERSION_SEND_TO,
      value: conversionData?.estimateId || '',
      currency: 'USD',
      ...(conversionData?.phone && { phone_number: conversionData.phone }),
      ...(conversionData?.email && { email: conversionData.email }),
      ...(conversionData?.service && { service_type: conversionData.service }),
    });

    if (import.meta.env.DEV) {
      console.log('✓ Google Ads conversion tracked', { conversionData });
    }
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
}

/**
 * Track a general analytics event for GA4.
 * Google Ads conversion tracking is handled separately by trackConversion().
 * @param eventName - Event name to track
 * @param eventData - Additional event data
 */
export function trackEvent(
  eventName: string,
  eventData?: {
    [key: string]: any;
  }
) {
  if (!window.gtag) {
    console.warn('gtag not initialized - event not tracked');
    return;
  }

  try {
    window.gtag('event', eventName, eventData || {});

    if (import.meta.env.DEV) {
      console.log(`✓ GA4 event tracked: ${eventName}`, { eventData });
    }
  } catch (error) {
    console.error(`Error tracking event ${eventName}:`, error);
  }
}
