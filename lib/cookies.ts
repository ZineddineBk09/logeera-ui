import Cookies from 'js-cookie';
import { APP_CONFIG } from '@/constants';

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Access token cookie management
export function setAccessTokenCookie(token: string) {
  Cookies.set(APP_CONFIG.ACCESS_TOKEN_KEY, token, {
    ...COOKIE_OPTIONS,
    expires: 1, // 1 day
  });
}

export function getAccessTokenCookie(): string | undefined {
  return Cookies.get(APP_CONFIG.ACCESS_TOKEN_KEY);
}

export function removeAccessTokenCookie() {
  Cookies.remove(APP_CONFIG.ACCESS_TOKEN_KEY, COOKIE_OPTIONS);
}

// Refresh token cookie management (set by server)
export function getRefreshTokenCookie(): string | undefined {
  return Cookies.get(APP_CONFIG.REFRESH_TOKEN_KEY);
}

export function removeRefreshTokenCookie() {
  Cookies.remove(APP_CONFIG.REFRESH_TOKEN_KEY, COOKIE_OPTIONS);
}

// Clear all auth cookies
export function clearAuthCookies() {
  removeAccessTokenCookie();
  removeRefreshTokenCookie();
}

// Check if user is authenticated based on cookies
export function isAuthenticatedFromCookies(): boolean {
  return !!getAccessTokenCookie();
}

// Server-side cookie utilities (for middleware and API routes)
export function getServerSideCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {};

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

export function getServerSideAccessToken(
  cookieHeader: string | null,
): string | null {
  const cookies = getServerSideCookies(cookieHeader);
  return cookies[APP_CONFIG.ACCESS_TOKEN_KEY] || null;
}

export function getServerSideRefreshToken(
  cookieHeader: string | null,
): string | null {
  const cookies = getServerSideCookies(cookieHeader);
  return cookies[APP_CONFIG.REFRESH_TOKEN_KEY] || null;
}
