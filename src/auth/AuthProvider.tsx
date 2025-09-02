import React from "react";
import { Auth0Provider, AppState, Auth0Context } from "@auth0/auth0-react";
import { getAuthConfig } from "@/lib/env";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const cfg = getAuthConfig();
  if (cfg.disabled || cfg.bypass) {
    const fake: any = {
      isAuthenticated: true,
      user: { email: 'local@dev' },
      isLoading: false,
      loginWithRedirect: async () => {},
      logout: () => {},
    };
    return <Auth0Context.Provider value={fake}>{children}</Auth0Context.Provider>;
  }

  const redirectUri = `${window.location.origin}${cfg.callbackPath}`;

  const onRedirectCallback = (appState?: AppState) => {
    const target = appState?.returnTo || cfg.afterLogin;
    window.history.replaceState({}, document.title, target);
  };

  return (
    <Auth0Provider
      domain={cfg.domain}
      clientId={cfg.clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
