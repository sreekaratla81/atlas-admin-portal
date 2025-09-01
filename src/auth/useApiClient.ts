import axios from 'axios';
import { useAuthMaybeBypass } from './authBypass';

const BYPASS = import.meta.env.VITE_AUTH_DISABLED === 'true';

const api = axios.create({
  baseURL: 'https://atlas-homes-api-gxdqfjc2btc0atbv.centralus-01.azurewebsites.net'
});

export function useApiClient() {
  const { getAccessTokenSilently } = useAuthMaybeBypass();
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  api.interceptors.request.use(async (config) => {
    if (!BYPASS && audience) {
      const token = await getAccessTokenSilently({ authorizationParams: { audience } });
      if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  });

  return api;
}
