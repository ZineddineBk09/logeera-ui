"use client";

import React, { createContext, useContext, useEffect } from "react";
import { SWRConfig } from "swr";
import { swrConfig } from "@/lib/swr-config";
import { useAuth as useAuthHook } from "@/lib/hooks/use-auth";
import { getAccessToken, setAccessToken } from "@/lib/api";
import { getAccessTokenCookie } from "@/lib/cookies";

// Legacy AuthContext for backward compatibility
interface AuthContextValue {
  user: any;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Legacy AuthProvider component for backward compatibility
function LegacyAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook();

  const value: AuthContextValue = {
    user: auth.user,
    accessToken: getAccessToken(),
    login: async (email: string, password: string) => {
      return auth.login({ email, password });
    },
    logout: auth.logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Main AuthProvider with SWR configuration
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize token from cookies on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getAccessTokenCookie();
      if (token) {
        setAccessToken(token);
      }
    }
  }, []);

  return (
    <SWRConfig value={swrConfig}>
      <LegacyAuthProvider>
        {children}
      </LegacyAuthProvider>
    </SWRConfig>
  );
}

// Legacy useAuth hook for backward compatibility
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


