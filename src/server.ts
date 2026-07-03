import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Content Security Policy Middleware
 * Protects against XSS, clickjacking, and other security threats
 */
const cspMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const cspPolicy = [
    // Script sources - strict CSP for security
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com",
    "worker-src 'self' blob:",
    // Style sources
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    // Font sources
    "font-src 'self' fonts.gstatic.com data:",
    // Image sources - allow https and data URIs
    "img-src 'self' data: https: blob:",
    // Media sources
    "media-src 'self' https:",
    // Connect sources - API calls
    "connect-src 'self' https: wss: ws://localhost:3000;",
    // Frame sources - allow YouTube embeds
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    // Frame ancestors - prevent clickjacking
    "frame-ancestors 'none'",
    // Base URI - prevent base tag injection
    "base-uri 'self'",
    // Form action - restrict form submissions
    "form-action 'self'",
    // Default fallback
    "default-src 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspPolicy);
  res.setHeader('Content-Security-Policy-Report-Only', cspPolicy);
  next();
};

/**
 * Security Headers Middleware
 * Sets additional security headers for production
 */
const securityHeadersMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy - limit referrer info
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy / Permissions policy
  res.setHeader('Permissions-Policy', 
    'geolocation=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  next();
};

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Apply security middleware
 */
app.use(cspMiddleware);
app.use(securityHeadersMiddleware);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
