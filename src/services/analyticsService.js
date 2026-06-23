// Google Analytics 4 (GA4) Service for Vue SPA

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Log helper for development mode
 */
function debugLog(...args) {
  if (import.meta.env.DEV) {
    console.log('%c[GA4 Analytics]', 'color: #0096E7; font-weight: bold;', ...args);
  }
}

/**
 * Dynamically injects Google Tag Manager scripts into the document head
 */
export function initGA() {
  if (typeof window === 'undefined') return;
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') {
    debugLog('No valid Measurement ID provided (using G-XXXXXXXXXX template). Actions will only log to console.');
    // Setup dummy gtag in dev/demo so the calls don't crash
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    return;
  }

  // Check if script is already injected
  if (document.getElementById('google-analytics-gtag')) {
    return;
  }

  try {
    // Inject script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.id = 'google-analytics-gtag';
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    
    // Disable default page_view tracking since we trigger it manually in SPA watch blocks
    window.gtag('config', GA_ID, {
      send_page_view: false
    });

    debugLog(`Successfully initialized GA4 script for ID: ${GA_ID}`);
  } catch (err) {
    console.warn('[GA4 Analytics] Error loading script tag:', err.message);
  }
}

/**
 * Sends a virtual page view event to Google Analytics.
 * Essential for SPA routing/state changes.
 * 
 * @param {string} pagePath - The virtual URL path (e.g. '/portfolio', '/contact')
 * @param {string} pageTitle - The title of the page view
 */
export function trackPageView(pagePath, pageTitle) {
  if (typeof window === 'undefined') return;
  
  const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  const pageLocation = window.location.origin + cleanPath;

  debugLog(`Tracking Virtual Pageview: Path="${cleanPath}", Title="${pageTitle}"`);

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: cleanPath,
      page_title: pageTitle,
      page_location: pageLocation
    });
  }
}

/**
 * Sends a custom conversion or engagement event to Google Analytics.
 * 
 * @param {string} eventName - The name of the event (e.g., 'booking_submit', 'toggle_music')
 * @param {Object} [params={}] - Optional key-value event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  debugLog(`Tracking Event: "${eventName}"`, params);

  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}
