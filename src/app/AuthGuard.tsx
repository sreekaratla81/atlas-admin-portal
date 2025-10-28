import { getAuthToken } from '@/shared/config/env';
import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function AuthGuard({ children }: PropsWithChildren) {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export default AuthGuard;
