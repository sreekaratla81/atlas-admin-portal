import { getApiBase, getGuestSearchMode } from '@/utils/env';

export const IS_LOCALHOST = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

export const ENV = {
  VITE_API_BASE: getApiBase(),
  VITE_GUEST_SEARCH_MODE: getGuestSearchMode(),
  VITE_AUTH_DISABLED: String(import.meta.env.VITE_AUTH_DISABLED || '').toLowerCase() === 'true',
  VITE_AUTH_BYPASS: String(import.meta.env.VITE_AUTH_BYPASS || '').toLowerCase() === 'true',
  VITE_AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN || '',
  VITE_AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  VITE_AUTH0_CALLBACK_PATH: import.meta.env.VITE_AUTH0_CALLBACK_PATH || '/auth/callback',
  VITE_DEFAULT_AFTER_LOGIN: import.meta.env.VITE_DEFAULT_AFTER_LOGIN || '/bookings',
  VITE_ALLOWED_EMAILS: import.meta.env.VITE_ALLOWED_EMAILS,
} as const;

export function getAuthConfig() {
  return {
    disabled: ENV.VITE_AUTH_DISABLED,
    bypass: ENV.VITE_AUTH_BYPASS,
    domain: ENV.VITE_AUTH0_DOMAIN,
    clientId: ENV.VITE_AUTH0_CLIENT_ID,
    callbackPath: ENV.VITE_AUTH0_CALLBACK_PATH,
    afterLogin: ENV.VITE_DEFAULT_AFTER_LOGIN,
  } as const;
}

export function getAllowedEmails(): string[] {
  const raw = ENV.VITE_ALLOWED_EMAILS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(x => String(x).trim()).filter(Boolean);
  } catch {
    // fall through
  }
  return String(raw).split(',').map(s => s.trim()).filter(Boolean);
}
