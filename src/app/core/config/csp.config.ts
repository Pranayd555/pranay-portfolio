/**
 * Content Security Policy Configuration
 * 
 * CSP helps prevent:
 * - XSS (Cross-Site Scripting) attacks
 * - Injection attacks
 * - Clickjacking
 * - MIME sniffing
 * - Unauthorized data exfiltration
 * 
 * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */

export const CSP_CONFIG = {
  /**
   * script-src: Controls which scripts can be executed
   * 'self': Only scripts from the same origin
   * 'unsafe-inline': Allow inline scripts (needed for Angular)
   * 'unsafe-eval': Allow eval() (needed for development)
   * *.googleapis.com: Allow Google APIs (Material Design, Analytics)
   * *.gstatic.com: Allow Google static resources
   */
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com",

  /**
   * style-src: Controls which stylesheets can be loaded
   * 'self': Only stylesheets from the same origin
   * 'unsafe-inline': Allow inline styles (needed for Angular)
   * fonts.googleapis.com: Google Fonts
   */
  'style-src': "'self' 'unsafe-inline' fonts.googleapis.com",

  /**
   * font-src: Controls which fonts can be loaded
   * 'self': Fonts from the same origin
   * fonts.gstatic.com: Google Fonts delivery
   * data: Allow data URIs for inline fonts
   */
  'font-src': "'self' fonts.gstatic.com data:",

  /**
   * img-src: Controls which images can be loaded
   * 'self': Images from the same origin
   * data: Allow data URIs (base64 encoded images)
   * https: Allow images over HTTPS
   * blob: Allow blob URLs (for generated images)
   */
  'img-src': "'self' data: https: blob:",

  /**
   * connect-src: Controls which URLs can be reached via:
   * - XMLHttpRequest (XHR)
   * - WebSocket
   * - fetch
   * - EventSource
   * 'self': Same origin
   * https: Any HTTPS endpoint
   * wss: WebSocket secure protocol
   */
  'connect-src': "'self' https: wss:",

  /**
   * media-src: Controls which audio/video can be loaded
   * 'self': Media from the same origin
   * https: Media over HTTPS
   */
  'media-src': "'self' https:",

  /**
   * frame-src: Controls which URLs can be embedded in iframes
   * https://www.youtube.com: Allow YouTube embeds
   * https://www.youtube-nocookie.com: Privacy-friendly YouTube embeds (no tracking cookies)
   */
  'frame-src': 'https://www.youtube.com https://www.youtube-nocookie.com',

  /**
   * frame-ancestors: Prevents embedding in iframes
   * 'none': Prevents any framing (strongest protection against clickjacking)
   */
  'frame-ancestors': "'none'",

  /**
   * base-uri: Restricts <base> tag URLs
   * 'self': Only same origin
   * Prevents base tag injection attacks
   */
  'base-uri': "'self'",

  /**
   * form-action: Restricts form submission endpoints
   * 'self': Only same origin forms
   * Prevents unauthorized form submissions
   */
  'form-action': "'self'",

  /**
   * default-src: Fallback for any source not explicitly defined
   * 'self': Only same origin resources
   */
  'default-src': "'self'",
};

/**
 * Additional Security Headers
 */
export const SECURITY_HEADERS = {
  /**
   * X-Frame-Options: Prevent clickjacking
   * DENY: Don't allow framing at all
   */
  'X-Frame-Options': 'DENY',

  /**
   * X-Content-Type-Options: Prevent MIME sniffing
   * nosniff: Force browser to respect Content-Type
   */
  'X-Content-Type-Options': 'nosniff',

  /**
   * X-XSS-Protection: Enable browser XSS filtering
   * 1; mode=block: Enable XSS filter and block page if attack detected
   */
  'X-XSS-Protection': '1; mode=block',

  /**
   * Referrer-Policy: Control how much referrer info is shared
   * strict-origin-when-cross-origin:
   * - Same-site: Send full URL
   * - Cross-site: Send only origin
   */
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  /**
   * Permissions-Policy: Disable unused browser features
   * Reduces attack surface by disabling features you don't use
   */
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
};

/**
 * Generate CSP header string
 * @returns Formatted CSP policy string for HTTP header
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([key, value]) => `${key} ${value}`)
    .join('; ');
}

/**
 * CSP Policy Summary for Reference
 * 
 * STRICT MODE CSP (Most Secure):
 * - Removes 'unsafe-inline' and 'unsafe-eval'
 * - Requires all scripts to be served from whitelisted origins
 * - Requires all styles to be in separate files
 * 
 * CURRENT MODE (Balanced):
 * - Uses 'unsafe-inline' for styles (needed for Angular)
 * - Uses 'unsafe-eval' for development/AOT compilation
 * - Good security with Angular compatibility
 * 
 * To transition to STRICT mode:
 * 1. Move all inline styles to separate stylesheet
 * 2. Move all inline scripts to separate files
 * 3. Use nonces or hashes for initial bootstrap scripts
 * 4. Remove 'unsafe-inline' and 'unsafe-eval'
 */
