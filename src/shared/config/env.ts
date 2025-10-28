export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  'https://atlas-homes-api-gxdqfjc2btc0atbv.centralus-01.azurewebsites.net';

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return (
    window.localStorage.getItem('atlas_token') ?? window.sessionStorage.getItem('atlas_token') ?? ''
  );
}
