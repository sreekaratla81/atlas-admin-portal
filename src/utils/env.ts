export type GuestSearchMode = 'local' | 'remote';

export const getGuestSearchMode = (): GuestSearchMode => {
  const raw = (import.meta.env.VITE_GUEST_SEARCH_MODE ?? 'local').toString().trim().toLowerCase();
  return raw === 'remote' ? 'remote' : 'local';
};

export const getApiBase = (): string => {
  const raw = (import.meta.env.VITE_API_BASE ?? '').trim();
  if (import.meta.env.PROD && /localhost/i.test(raw)) {
    console.warn('getApiBase: blocking localhost API base in production');
    throw new Error('localhost API base not allowed in production');
  }
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};
