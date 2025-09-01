import React, { createContext, useContext } from "react";

const BYPASS = import.meta.env.VITE_AUTH_DISABLED === "true";

type FakeAuth = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: { email: string };
  loginWithRedirect: (opts?: { appState?: { returnTo?: string } }) => Promise<void>;
  logout: (opts?: { logoutParams?: { returnTo?: string } }) => void;
  getAccessTokenSilently: (...args: any[]) => Promise<string | undefined>;
};

const FakeAuthContext = createContext<FakeAuth | null>(null);

export const AuthBypassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!BYPASS) return <>{children}</>;
  const value: FakeAuth = {
    isAuthenticated: true,
    isLoading: false,
    user: { email: "atlashomeskphb@gmail.com" },
    loginWithRedirect: async () => {},
    logout: () => {},
    getAccessTokenSilently: async () => undefined,
  };
  return <FakeAuthContext.Provider value={value}>{children}</FakeAuthContext.Provider>;
};

export const useAuthMaybeBypass = () => {
  if (BYPASS) {
    const ctx = useContext(FakeAuthContext);
    if (!ctx) throw new Error("Auth bypass context missing");
    return ctx;
  }
  return require("@auth0/auth0-react").useAuth0();
};
