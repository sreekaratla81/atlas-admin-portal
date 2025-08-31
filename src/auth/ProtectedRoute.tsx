import { BYPASS } from './config';
import { useAuth0 } from '@auth0/auth0-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (BYPASS) return <>{children}</>;
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  if (isLoading) return <div>Loading…</div>;
  if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
    return null;
  }
  return <>{children}</>;
}
