import axios from 'axios';
import { useEffect } from 'react';
import { useAuthMaybeBypass } from '../auth/authBypass';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api',
});

export function useHttp() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuthMaybeBypass();
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  useEffect(() => {
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
  }, [getAccessTokenSilently, loginWithRedirect, audience]);

  return http;
}

export default http;
