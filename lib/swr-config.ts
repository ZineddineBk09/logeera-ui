import { SWRConfiguration } from 'swr';
import { APP_CONFIG } from '@/constants';

// SWR Global Configuration
export const swrConfig: SWRConfiguration = {
  // Global fetcher function
  fetcher: async (url: string, options?: RequestInit) => {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = new Error('An error occurred while fetching the data.');
      // Attach extra info to the error object
      (error as any).info = await response.json().catch(() => ({}));
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  },

  // Global error retry configuration
  errorRetryCount: 3,
  errorRetryInterval: 1000,

  // Revalidation configuration
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,

  // Cache configuration
  dedupingInterval: 2000, // 2 seconds
  focusThrottleInterval: 5000, // 5 seconds

  // Loading timeout
  loadingTimeout: 10000, // 10 seconds

  // Global error handler
  onError: (error, key) => {
    console.error('SWR Error:', error, 'Key:', key);

    // Handle specific error cases
    if (error.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  // Global success handler
  onSuccess: (data, key) => {
    console.log('SWR Success:', key, data);
  },
};

// SWR Key generators
export const swrKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Trips
  trips: {
    list: (params?: Record<string, string>) =>
      ['trips', 'list', params] as const,
    nearby: (params: Record<string, string>) =>
      ['trips', 'nearby', params] as const,
    detail: (id: string) => ['trips', 'detail', id] as const,
  },

  // Requests
  requests: {
    incoming: () => ['requests', 'incoming'] as const,
    outgoing: () => ['requests', 'outgoing'] as const,
    detail: (id: string) => ['requests', 'detail', id] as const,
  },

  // Chat
  chat: {
    list: () => ['chat', 'list'] as const,
    between: (userAId: string, userBId: string) =>
      ['chat', 'between', userAId, userBId] as const,
    messages: (chatId: string) => ['chat', 'messages', chatId] as const,
  },

  // Users
  users: {
    detail: (id: string) => ['users', 'detail', id] as const,
    ratings: (id: string) => ['users', 'ratings', id] as const,
  },

  // Drivers
  drivers: {
    list: (params?: Record<string, string>) =>
      ['drivers', 'list', params] as const,
    trusted: (limit?: string) => ['drivers', 'trusted', limit] as const,
  },

  // Ratings
  ratings: {
    list: (userId?: string) => ['ratings', 'list', userId] as const,
    pending: () => ['ratings', 'pending'] as const,
    trip: (tripId: string) => ['ratings', 'trip', tripId] as const,
  },

  // Blocked Users
  blocked: {
    list: () => ['blocked', 'list'] as const,
  },

  // Admin
  admin: {
    dashboard: (timeRange: string) =>
      ['admin', 'dashboard', timeRange] as const,
    users: (params?: Record<string, string>) =>
      ['admin', 'users', params] as const,
    user: (id: string) => ['admin', 'users', id] as const,
    trips: (params?: Record<string, string>) =>
      ['admin', 'trips', params] as const,
    trip: (id: string) => ['admin', 'trips', id] as const,
    requests: (params?: Record<string, string>) =>
      ['admin', 'requests', params] as const,
    request: (id: string) => ['admin', 'requests', id] as const,
    messages: (params?: Record<string, string>) =>
      ['admin', 'messages', params] as const,
    message: (id: string) => ['admin', 'messages', id] as const,
    analytics: (timeRange: string) =>
      ['admin', 'analytics', timeRange] as const,
    settings: () => ['admin', 'settings'] as const,
    contact: (params?: Record<string, string>) =>
      ['admin', 'contact', params] as const,
    contactSubmission: (id: string) => ['admin', 'contact', id] as const,
  },
} as const;
