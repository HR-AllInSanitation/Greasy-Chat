/**
 * Google Ads Conversion Tracking Utility
 * Provides a type-safe wrapper around the global gtag function for tracking conversions
 * Conversion ID: AW-17824333319
 */

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
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
      send_to: 'AW-17824333319/H7e3CMyShP8bEIf8prNC',
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
 * Track a custom event for Google Ads (e.g., estimate_created)
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
    window.gtag('event', eventName, {
      send_to: 'AW-17824333319',
      ...eventData,
    });

    if (import.meta.env.DEV) {
      console.log(`✓ Google Ads event tracked: ${eventName}`, { eventData });
    }
  } catch (error) {
    console.error(`Error tracking event ${eventName}:`, error);
  }
}
