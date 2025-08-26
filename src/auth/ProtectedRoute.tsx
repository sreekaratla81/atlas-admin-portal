import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    user,
    logout,
  } = useAuth0();
  const location = useLocation();
  const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: location.pathname } });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, location.pathname]);

  useEffect(() => {
    if (isAuthenticated && user?.email !== allowedEmail) {
      const timeout = setTimeout(() => {
        logout({ logoutParams: { returnTo: window.location.origin } });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, user, allowedEmail, logout]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.email !== allowedEmail) {
    return <div>Not authorized</div>;
  }

  return children;
};

export default ProtectedRoute;
