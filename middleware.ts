import { NextResponse, NextRequest } from 'next/server';
import { detectBrandFromHost } from './src/lib/domainBranding';

/**
 * Middleware for domain-based branding and SEO
 * This handles:
 * - Domain detection and brand configuration
 * - Security headers
 * - SEO headers
 * - CORS configuration
 * - No redirects on localhost or valid domains
 */

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Detect brand based on hostname
  const brandConfig = detectBrandFromHost(hostname);
  
  // Clone the request headers to add brand information
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-brand', brandConfig.logoType);
  requestHeaders.set('x-brand-name', brandConfig.brandName);
  requestHeaders.set('x-canonical-url', brandConfig.canonicalUrl);
  
  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Set SEO headers based on brand
  response.headers.set('X-Brand', brandConfig.brandName);
  response.headers.set('X-Brand-Theme', brandConfig.primaryColor);

  // Set CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Do NOT redirect on localhost or valid domains - only set headers
  // This allows development on localhost without redirects

  // Add brand data to cookies for client-side usage
  const brandData = JSON.stringify({
    brand: brandConfig.logoType,
    name: brandConfig.brandName,
    canonical: brandConfig.canonicalUrl,
    theme: brandConfig.primaryColor,
  });
  
  response.cookies.set('brand_config', brandData, {
    path: '/',
    maxAge: 86400, // 24 hours
    httpOnly: false, // Allow client-side access
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
