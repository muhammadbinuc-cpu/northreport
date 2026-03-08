import { NextResponse, type NextRequest } from 'next/server';
import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Enable Google social connection in Auth0 Dashboard > Authentication > Social
const auth0 = new Auth0Client();

/**
 * Generates CSP header with nonce for inline script security
 */
function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';

  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'${isDev ? ` 'unsafe-eval'` : ''} blob: https://apis.google.com`,
    `worker-src 'self' blob:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://*.auth0.com https://generativelanguage.googleapis.com https://api.mapbox.com https://*.mapbox.com https://events.mapbox.com https://api.elevenlabs.io`,
    `frame-src 'self' https://*.auth0.com`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ].join('; ');
}

/**
 * Applies security headers to the response
 */
function applySecurityHeaders(response: NextResponse, nonce: string): void {
  response.headers.set('Content-Security-Policy', buildCspHeader(nonce));
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
}

/**
 * Next.js 16 proxy handler - consolidates middleware and Auth0 logic
 * Auth0 v4 SDK mounts routes at /auth/* (not /api/auth/*)
 */
export async function proxy(request: NextRequest) {
  // Generate a unique nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const pathname = request.nextUrl.pathname;

  // For Auth0 routes, delegate to Auth0 middleware
  if (pathname.startsWith('/auth')) {
    const auth0Response = await auth0.middleware(request);
    // Apply security headers to Auth0 responses as well
    if (auth0Response) {
      applySecurityHeaders(auth0Response as NextResponse, nonce);
    }
    return auth0Response;
  }

  // For all other matched routes, apply CSP and continue
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  applySecurityHeaders(response, nonce);

  return response;
}

export const config = {
  matcher: [
    // Protected app routes (require auth via Auth0)
    '/feed/:path*',
    '/map/:path*',
    '/dashboard/:path*',
    '/report/:path*',
    // Auth0 authentication routes
    '/auth/:path*',
    // CSP for all other pages (excluding static assets and API routes)
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

