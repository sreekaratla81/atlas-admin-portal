import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffectiveAuth } from './useEffectiveAuth';
import RequireAuth from './RequireAuth';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoading, effectiveIsAuthenticated, effectiveUser, loginWithRedirect, bypassEnabled } = useEffectiveAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !effectiveIsAuthenticated && !bypassEnabled) {
      void loginWithRedirect({ appState: { returnTo: location.pathname + location.search } });
    }
  }, [isLoading, effectiveIsAuthenticated, bypassEnabled, loginWithRedirect, location]);

  if (isLoading) return null;

  // In dev with bypass on but not yet loaded, just show nothing briefly;
  // once /auth-bypass.json loads, user becomes authenticated.
  if (!effectiveIsAuthenticated && bypassEnabled) return null;

  // In prod, after redirectWithLogin call we render nothing here.
  if (!effectiveIsAuthenticated) return null;

  return <RequireAuth user={effectiveUser}>{children}</RequireAuth>;
}
