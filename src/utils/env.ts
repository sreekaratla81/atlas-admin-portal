const metaEnv = (import.meta as any)?.env ?? {};

export const getApiBase = (): string => {
  const rawValue = metaEnv.VITE_API_BASE ?? process.env.VITE_API_BASE ?? '';
  const raw = String(rawValue).trim();
  const isProd = Boolean(metaEnv.PROD ?? process.env.NODE_ENV === 'production');
  if (isProd && /localhost/i.test(raw)) {
    console.warn('getApiBase: blocking localhost API base in production');
    throw new Error('localhost API base not allowed in production');
  }
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};
