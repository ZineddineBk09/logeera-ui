import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getServerSideAccessToken } from '@/lib/cookies';
import {
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  AUTH_REDIRECT_ROUTES,
  ROUTES,
  APP_CONFIG,
} from '@/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.CORS_ORIGIN || 'http://localhost:3000',
    );
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  // Route protection for frontend routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRedirectRoute = AUTH_REDIRECT_ROUTES.includes(pathname as any);

  // Get access token from cookies
  const accessToken = getServerSideAccessToken(request.headers.get('cookie'));

  let user = null;
  if (accessToken) {
    console.log('accessToken', accessToken);
    try {
      user = await verifyAccessToken(accessToken);
      console.log('user', user);
    } catch (error) {
      console.log('Invalid token, clearing cookies:', error);
      // Token is invalid, will be handled below
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRedirectRoute && user) {
    console.log(`Redirecting authenticated user from ${pathname} to dashboard`);
    
    // Check if there's a redirect parameter to honor
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const redirectUrl = redirectParam && redirectParam !== pathname 
      ? redirectParam 
      : ROUTES.DASHBOARD;
      
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect routes that require authentication
  if (isProtectedRoute && !user) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (isAdminRoute && (!user || user.role !== APP_CONFIG.USER_ROLES.ADMIN)) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // Protected frontend routes
    '/dashboard/:path*',
    '/trips/:path*',
    '/publish/:path*',
    '/requests/:path*',
    '/chats/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/reviews/:path*',
    '/settings/:path*',
    '/admin/:path*',
    // Auth redirect routes (important: these need to be exact matches)
    '/login',
    '/register',
  ],
};
