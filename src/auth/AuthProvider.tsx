import React from "react";
import { Auth0Provider, AppState } from "@auth0/auth0-react";
import { getAuthConfig } from "@/lib/env";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const cfg = getAuthConfig();
  if (cfg.disabled) return <>{children}</>;

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
