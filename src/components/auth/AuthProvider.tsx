'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, UserProfile, AuthTokens, SessionManager, AuthConfig } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  login: (redirectUri?: string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authService] = useState(() => new AuthService(config));

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const tokens = SessionManager.getTokens();
      if (tokens) {
        // Validate token
        const isValid = await authService.validateToken(tokens.accessToken);
        if (isValid) {
          const userProfile = await authService.getUserProfile(tokens.accessToken);
          setUser(userProfile);
          setIsAuthenticated(true);
        } else {
          // Try to refresh token
          try {
            await refreshToken();
          } catch (error) {
            SessionManager.clearTokens();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      SessionManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = (redirectUri?: string) => {
    const uri = redirectUri || `${window.location.origin}/auth/callback`;
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state for validation
    sessionStorage.setItem('auth_state', state);
    
    const authUrl = authService.getAuthorizationUrl(uri, state);
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      const tokens = SessionManager.getTokens();
      if (tokens) {
        await authService.signOut(tokens.accessToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      SessionManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to logout URL
      const logoutUrl = authService.getLogoutUrl(`${window.location.origin}/auth/logout`);
      window.location.href = logoutUrl;
    }
  };

  const refreshToken = async () => {
    const tokens = SessionManager.getTokens();
    if (!tokens) {
      throw new Error('No tokens available for refresh');
    }

    try {
      const newTokens = await authService.refreshTokens(tokens.refreshToken);
      SessionManager.saveTokens(newTokens);
      
      const userProfile = await authService.getUserProfile(newTokens.accessToken);
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      SessionManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role as any) || false;
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshToken,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user, loading, hasRole } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}