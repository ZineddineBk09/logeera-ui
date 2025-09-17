import { useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { api, apiPost, setAccessToken, getAccessToken } from '@/lib/api';
import { swrKeys } from '@/lib/swr-config';
import { API_ENDPOINTS, ROUTES, APP_CONFIG } from '@/constants';
import { getAccessTokenCookie, clearAuthCookies } from '@/lib/cookies';
import { toast } from 'sonner';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  type?: string;
  status?: string;
  role?: string;
  averageRating?: number;
  ratingCount?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  officialIdNumber: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Auth hook
export function useAuth() {
  const router = useRouter();
  
  // Get current user data
  const { data: user, error, mutate, isLoading } = useSWR<User>(
    getAccessToken() ? swrKeys.auth.me() : null,
    () => api(API_ENDPOINTS.AUTH_ME).then(res => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      onError: (error) => {
        console.error('Auth error:', error);
        if (error.status === 401) {
          setAccessToken(null);
          clearAuthCookies();
          router.push(ROUTES.LOGIN);
        }
      },
    }
  );

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Login failed');
        return false;
      }

      const { accessToken } = await response.json();
      setAccessToken(accessToken);
      
      // Revalidate user data
      await mutate();
      
      // Check if user is blocked after getting user data
      const userResponse = await fetch(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.status === 'BLOCKED') {
          setAccessToken(null);
          clearAuthCookies();
          toast.error('Your account has been blocked. Please contact support.');
          return false;
        }
      }
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  }, [mutate]);

  // Register function
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.AUTH_REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Registration failed');
        return false;
      }

      const { accessToken } = await response.json();
      setAccessToken(accessToken);
      
      // Revalidate user data
      await mutate();
      
      toast.success('Registration successful');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    }
  }, [mutate]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setAccessToken(null);
      clearAuthCookies();
      await mutate(undefined, false);
      
      toast.success('Logged out successfully');
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [mutate, router]);

  // Change password function
  const changePassword = useCallback(async (data: ChangePasswordData): Promise<boolean> => {
    try {
      await apiPost(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, data);
      toast.success('Password changed successfully');
      return true;
    } catch (error: any) {
      console.error('Change password error:', error);
      const message = error.info?.error || 'Failed to change password';
      toast.error(message);
      return false;
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!user && !error;
  
  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user?.role]);

  // Check if user is admin
  const isAdmin = hasRole(APP_CONFIG.USER_ROLES.ADMIN);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    hasRole,
    login,
    register,
    logout,
    changePassword,
    mutate,
  };
}

// Hook for protecting routes
export function useRequireAuth(redirectTo: string = ROUTES.LOGIN) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Hook for requiring admin role
export function useRequireAdmin(redirectTo: string = ROUTES.DASHBOARD) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push(redirectTo);
    }
  }, [isAdmin, isLoading, isAuthenticated, router, redirectTo]);

  return { isAdmin, isLoading, isAuthenticated };
}
