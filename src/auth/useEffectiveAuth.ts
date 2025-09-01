import { useAuth0 } from '@auth0/auth0-react';
import { useAuthMaybeBypass } from './authBypass';
import { getAuthConfig } from '@/lib/env';

const cfg = getAuthConfig();
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('Bypass enabled:', cfg.bypass);
}

export function useEffectiveAuth() {
  const { isAuthenticated, user, isLoading, loginWithRedirect, logout } = useAuth0();
  const { bypassUser } = useAuthMaybeBypass();

  const bypassEnabled = (import.meta.env.DEV && cfg.bypass) || cfg.disabled;
  const effectiveUser = bypassEnabled ? (bypassUser || {}) : (isAuthenticated ? user : null);
  const effectiveIsAuthenticated = bypassEnabled ? true : !!effectiveUser;

  return {
    isLoading: bypassEnabled ? false : isLoading,
    effectiveIsAuthenticated,
    effectiveUser,
    loginWithRedirect,
    logout,
    bypassEnabled,
  };
}
