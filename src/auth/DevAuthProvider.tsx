import React, { createContext } from 'react';
import { ALLOWED_EMAIL } from './config';

type DevAuth = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { email: string; name: string };
  loginWithRedirect: () => void;
  logout: () => void;
  getAccessTokenSilently: () => Promise<string | null>;
};

export const DevAuthContext = createContext<DevAuth | null>(null);

export default function DevAuthProvider({ children }: { children: React.ReactNode }) {
  const value: DevAuth = {
    isAuthenticated: true,
    isLoading: false,
    user: { email: ALLOWED_EMAIL, name: 'Dev Bypass' },
    loginWithRedirect: () => {},
    logout: () => {},
    getAccessTokenSilently: async () => null,
  };
  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
}
