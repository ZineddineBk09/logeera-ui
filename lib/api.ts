import { APP_CONFIG, API_ENDPOINTS } from '@/constants';
import { 
  setAccessTokenCookie, 
  getAccessTokenCookie, 
  removeAccessTokenCookie,
  clearAuthCookies 
} from '@/lib/cookies';

// Token management with cookies
let accessTokenMemory: string | null = null;

export function setAccessToken(token: string | null) {
  accessTokenMemory = token;
  
  if (typeof window !== 'undefined') {
    if (token) {
      setAccessTokenCookie(token);
    } else {
      removeAccessTokenCookie();
    }
  }
}

export function getAccessToken(): string | null {
  // First try memory, then cookies
  if (accessTokenMemory) return accessTokenMemory;
  
  if (typeof window !== 'undefined') {
    const token = getAccessTokenCookie();
    if (token) {
      accessTokenMemory = token;
      return token;
    }
  }
  
  return null;
}

// Enhanced API client with automatic token refresh
export async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  
  const makeRequest = (authToken?: string): RequestInit => ({
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  // First attempt with current token
  let response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, makeRequest(token || undefined));

  // If unauthorized, try to refresh token
  if (response.status === 401 && token) {
    try {
      const refreshResponse = await fetch(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const { accessToken: newToken } = await refreshResponse.json();
        setAccessToken(newToken);
        
        // Retry original request with new token
        response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, makeRequest(newToken));
      } else {
        // Refresh failed, clear all auth cookies
        setAccessToken(null);
        clearAuthCookies();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setAccessToken(null);
      clearAuthCookies();
    }
  }

  return response;
}

// API response helpers
export async function apiJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const response = await api(path, init);
  
  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    (error as any).status = response.status;
    (error as any).response = response;
    throw error;
  }
  
  return response.json();
}

// API mutation helpers
export async function apiPost<T = any>(path: string, data?: any): Promise<T> {
  return apiJson<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPut<T = any>(path: string, data?: any): Promise<T> {
  return apiJson<T>(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPatch<T = any>(path: string, data?: any): Promise<T> {
  return apiJson<T>(path, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  return apiJson<T>(path, {
    method: 'DELETE',
  });
}


