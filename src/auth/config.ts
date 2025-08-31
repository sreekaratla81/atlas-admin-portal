export const IS_LOCALHOST = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
export const BYPASS =
  import.meta.env.VITE_AUTH_BYPASS === 'true' &&
  import.meta.env.DEV &&
  IS_LOCALHOST;

export const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL || 'dev@local';
export const AUTH0 = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
};
