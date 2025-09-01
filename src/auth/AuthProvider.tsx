import React from "react";
import { Auth0Provider, AppState } from "@auth0/auth0-react";

const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
const callbackPath = import.meta.env.VITE_AUTH0_CALLBACK_PATH || "/auth/callback";
const defaultAfterLogin = import.meta.env.VITE_DEFAULT_AFTER_LOGIN || "/bookings";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const redirectUri = `${window.location.origin}${callbackPath}`;

  const onRedirectCallback = (appState?: AppState) => {
    const target = appState?.returnTo || defaultAfterLogin;
    window.history.replaceState({}, document.title, target);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
