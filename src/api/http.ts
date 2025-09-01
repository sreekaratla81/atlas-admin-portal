import axios from 'axios';
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffectiveAuth } from '../auth/useEffectiveAuth';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api',
});

export function useHttp() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();
  const { bypassEnabled } = useEffectiveAuth();
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  useEffect(() => {
    if (bypassEnabled) return;

    const reqInterceptor = http.interceptors.request.use(async (config) => {
      if (audience) {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience },
        });
        if (token)
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
      }
      return config;
    });

    const resInterceptor = http.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          void loginWithRedirect();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      http.interceptors.request.eject(reqInterceptor);
      http.interceptors.response.eject(resInterceptor);
    };
  }, [getAccessTokenSilently, loginWithRedirect, audience, bypassEnabled]);

  return http;
}

export default http;
