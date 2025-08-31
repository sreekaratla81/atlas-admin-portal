import { Auth0Provider } from '@auth0/auth0-react';
import { AUTH0 } from './config';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const audience = AUTH0.audience;
  return (
    <Auth0Provider
      domain={AUTH0.domain}
      clientId={AUTH0.clientId}
      authorizationParams={{
        scope: 'openid profile email',
        redirect_uri: window.location.origin + '/auth/callback',
        ...(audience ? { audience } : {}),
      }}
      onRedirectCallback={({ appState }) =>
        window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname)
      }
    >
      {children}
    </Auth0Provider>
  );
}
