import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffectiveAuth } from './useEffectiveAuth';

const api = axios.create({
  baseURL: 'https://atlas-homes-api-gxdqfjc2btc0atbv.centralus-01.azurewebsites.net'
});

export function useApiClient() {
  const { getAccessTokenSilently } = useAuth0();
  const { bypassEnabled } = useEffectiveAuth();
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  api.interceptors.request.use(async (config) => {
    if (!bypassEnabled && audience) {
      const token = await getAccessTokenSilently({ authorizationParams: { audience } });
      if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  });

  return api;
}
