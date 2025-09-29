// App Routes
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  HELP: '/help',

  // Protected routes
  DASHBOARD: '/dashboard',
  TRIPS: '/trips',
  PUBLISH: '/publish',
  REQUESTS: '/requests',
  CHAT: '/chat',
  PROFILE: '/profile',
  REVIEWS: '/reviews',
  SETTINGS: '/settings',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_TRIPS: '/admin/trips',
  ADMIN_REQUESTS: '/admin/requests',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_ME: '/api/auth/me',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_CHANGE_PASSWORD: '/api/auth/change-password',

  // Trips
  TRIPS: '/api/trips',
  TRIPS_NEARBY: '/api/trips/nearby',
  TRIPS_COMPLETE: (id: string) => `/api/trips/${id}/complete`,

  // Requests
  REQUESTS: '/api/requests',
  REQUESTS_INCOMING: '/api/requests/incoming',
  REQUESTS_OUTGOING: '/api/requests/outgoing',
  REQUESTS_STATUS: (id: string) => `/api/requests/${id}/status`,

  // Chat
  CHAT_BETWEEN: '/api/chat/between',
  CHAT_MESSAGES: (chatId: string) => `/api/chat/${chatId}/messages`,

  // Ratings
  RATINGS: '/api/ratings',

  // Health
  HEALTH: '/api/health',
  METRICS: '/api/metrics',

  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER: (id: string) => `/api/admin/users/${id}`,
  ADMIN_USER_BLOCK: (id: string) => `/api/admin/users/${id}/block`,
  ADMIN_USER_UNBLOCK: (id: string) => `/api/admin/users/${id}/unblock`,
  ADMIN_TRIPS: '/api/admin/trips',
  ADMIN_TRIP: (id: string) => `/api/admin/trips/${id}`,
  ADMIN_REQUESTS: '/api/admin/requests',
  ADMIN_REQUEST: (id: string) => `/api/admin/requests/${id}`,
  ADMIN_MESSAGES: '/api/admin/messages',
  ADMIN_MESSAGE: (id: string) => `/api/admin/messages/${id}`,
  ADMIN_ANALYTICS: '/api/admin/analytics',
  ADMIN_SETTINGS: '/api/admin/settings',
} as const;

// App Constants
export const APP_CONFIG = {
  NAME: 'Logeera',
  DESCRIPTION: 'Modern ride-sharing platform connecting travelers and drivers',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',

  // Auth
  ACCESS_TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // File uploads
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Trip statuses
  TRIP_STATUS: {
    PUBLISHED: 'PUBLISHED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },

  // Request statuses
  REQUEST_STATUS: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
  },

  // User roles
  USER_ROLES: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
  },

  // User types
  USER_TYPES: {
    PERSON: 'PERSON',
    BUSINESS: 'BUSINESS',
  },

  // Vehicle types
  VEHICLE_TYPES: {
    CAR: 'CAR',
    VAN: 'VAN',
    TRUCK: 'TRUCK',
    BIKE: 'BIKE',
  },
} as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  // ROUTES.TRIPS,
  ROUTES.PUBLISH,
  ROUTES.REQUESTS,
  ROUTES.CHAT,
  ROUTES.PROFILE,
  ROUTES.REVIEWS,
  ROUTES.SETTINGS,
] as const;

// Admin routes that require admin role
export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_TRIPS,
  ROUTES.ADMIN_REQUESTS,
  ROUTES.ADMIN_ANALYTICS,
] as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.HELP,
] as const;

// Routes that redirect to dashboard if user is already authenticated
export const AUTH_REDIRECT_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;
