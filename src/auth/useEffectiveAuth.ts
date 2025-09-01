import { useAuth0 } from '@auth0/auth0-react';
import { useAuthMaybeBypass } from './authBypass';

if (import.meta.env.DEV) {
  console.log('Bypass enabled:', import.meta.env.VITE_AUTH_BYPASS === 'true');
}

export function useEffectiveAuth() {
  const { isAuthenticated, user, isLoading, loginWithRedirect, logout } = useAuth0();
  const { bypassUser } = useAuthMaybeBypass();

  const bypassEnabled = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true';
  const effectiveUser = (bypassEnabled && bypassUser) ? bypassUser : (isAuthenticated ? user : null);
  const effectiveIsAuthenticated = !!effectiveUser;

  return { isLoading, effectiveIsAuthenticated, effectiveUser, loginWithRedirect, logout, bypassEnabled };
}
