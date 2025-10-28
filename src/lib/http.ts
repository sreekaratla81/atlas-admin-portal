import { getApiBase } from '@/utils/env';

const API_BASE = getApiBase();
const IS_DEV = import.meta.env?.DEV ?? process.env.DEV === 'true' ?? false;
const IS_LOCALHOST =
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const hasProtocol = /^https?:\/\//i.test(path);
  const shouldBypassBase = IS_DEV && IS_LOCALHOST;

  let url = path;
  if (!hasProtocol) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    url = shouldBypassBase ? normalizedPath : `${API_BASE}${normalizedPath}`;
  }

  if (!shouldBypassBase && /localhost/i.test(url)) {
    throw new Error('Refusing localhost request from non-localhost host');
  }

  const response = await fetch(url, { credentials: 'include', ...init });
  if (!response.ok) {
    const payload = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${payload}`);
  }

  return response;
}
