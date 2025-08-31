import axios from 'axios';
import { BYPASS } from './config';
import { useAtlasAuth } from './useAtlasAuth';

const api = axios.create({
  baseURL: 'https://atlas-homes-api-gxdqfjc2btc0atbv.centralus-01.azurewebsites.net'
});

export function useApiClient() {
  const { getAccessTokenSilently } = useAtlasAuth();
  api.interceptors.request.use(async (config) => {
    if (!BYPASS) {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      });
      if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  });
  return api;
}
