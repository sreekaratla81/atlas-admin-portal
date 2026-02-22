import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { getApiBase } from '@/utils/env';

interface AuthUser {
  email: string;
  name: string;
  role: string;
  tenantId: number;
  tenantSlug: string;
  tenantName: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'atlas_admin_token';
const USER_KEY = 'atlas_admin_user';

const AuthContext = createContext<AuthContextValue | null>(null);

function parseStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = parseStoredUser();
    return {
      token,
      user,
      isAuthenticated: !!token && !!user,
      isLoading: false,
    };
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Login failed (${res.status})`);
      }

      const data = await res.json();
      const user: AuthUser = {
        email: data.email,
        name: data.name,
        role: data.role,
        tenantId: data.tenantId,
        tenantSlug: data.tenantSlug,
        tenantName: data.tenantName,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setState({
        token: data.token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Get the stored JWT token (for API interceptor). */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Get the stored user's tenant slug (for X-Tenant-Slug header). */
export function getStoredTenantSlug(): string | null {
  const user = parseStoredUser();
  return user?.tenantSlug ?? null;
}
