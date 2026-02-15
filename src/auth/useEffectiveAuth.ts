import { useAuth0 } from '@auth0/auth0-react';
import { getAuthConfig } from '@/lib/env';

const cfg = getAuthConfig();
if (import.meta.env.DEV) {
  console.log('Bypass enabled:', cfg.bypass || cfg.disabled);
}

export function useEffectiveAuth() {
  const { isAuthenticated, user, isLoading, loginWithRedirect, logout } = useAuth0();
  const bypassEnabled = cfg.disabled || cfg.bypass;
  const effectiveUser = bypassEnabled ? (user || { email: 'local@dev' }) : (isAuthenticated ? user : null);
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
