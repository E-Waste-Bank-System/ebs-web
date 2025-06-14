'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from './api-client';
import { useProfile } from './queries';
import type { Profile } from './api-client';

interface AuthContextType {
  isAuthenticated: boolean;
  profile: Profile | null;
  isLoading: boolean;
  hasToken: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string | string[]) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [hasToken, setHasToken] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Initialize token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      setHasToken(true);
    }
    setIsInitialized(true);
  }, []);

  // Only fetch profile if we have a token
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useProfile({
    enabled: hasToken && isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle profile fetch errors
  useEffect(() => {
    if (profileError && hasToken) {
      console.error('Profile fetch failed:', profileError);
      logout();
    }
  }, [profileError, hasToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.access_token) {
        apiClient.setToken(response.access_token);
        localStorage.setItem('auth_token', response.access_token);
        setHasToken(true);
        
        // Redirect to admin dashboard
        router.push('/admin');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');
    setHasToken(false);
    router.push('/login');
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!profile) return false;
    
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    
    return profile.role === role;
  };

  const isAuthenticated = Boolean(hasToken && profile);
  const isLoading = !isInitialized || (hasToken && profileLoading);
  const isAdmin = hasRole(['ADMIN', 'SUPERADMIN']);
  const isSuperAdmin = hasRole('SUPERADMIN');

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        profile,
        isLoading,
        hasToken,
        login,
        logout,
        hasRole,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Route Protection HOC
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    requireAuth?: boolean;
    requireRoles?: string[];
    redirectTo?: string;
  } = {}
) {
  const {
    requireAuth = true,
    requireRoles = [],
    redirectTo = '/login'
  } = options;

  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading, hasRole, profile } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          router.push(redirectTo);
        } else if (requireRoles.length > 0 && !hasRole(requireRoles)) {
          router.push('/unauthorized');
        }
      }
    }, [isAuthenticated, isLoading, hasRole, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (requireRoles.length > 0 && !hasRole(requireRoles)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
} 