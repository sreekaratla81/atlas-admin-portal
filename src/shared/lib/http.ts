import { API_BASE, getAuthToken } from '@/shared/config/env';
import { toast } from 'react-hot-toast';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions<TBody> = {
  body?: TBody;
  signal?: AbortSignal;
};

async function request<TResult, TBody = unknown>(
  method: HttpMethod,
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResult> {
  const trimmedBase = API_BASE.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${trimmedBase}${normalizedPath}`;
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const init: RequestInit = {
    method,
    headers,
    signal: options.signal,
  };

  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    const response = await fetch(url, init);
    const ended = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = Math.round(ended - started);

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(`[http] ${method} ${url} - ${elapsed}ms`);
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');

    if (!response.ok) {
      const payload = isJson ? await response.json().catch(() => undefined) : undefined;
      const message = payload?.message ?? payload?.error ?? response.statusText;
      toast.error(message || 'Request failed');
      throw new Error(message || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as TResult;
    }

    if (!isJson) {
      return undefined as TResult;
    }

    return (await response.json()) as TResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    toast.error(message);
    throw error instanceof Error ? error : new Error(message);
  }
}

export function get<TResult>(path: string, options?: RequestOptions<never>) {
  return request<TResult>('GET', path, options);
}

export function post<TResult, TBody = unknown>(path: string, body: TBody) {
  return request<TResult, TBody>('POST', path, { body });
}

export function put<TResult, TBody = unknown>(path: string, body: TBody) {
  return request<TResult, TBody>('PUT', path, { body });
}

export function patch<TResult, TBody = unknown>(path: string, body: TBody) {
  return request<TResult, TBody>('PATCH', path, { body });
}

export function del<TResult>(path: string) {
  return request<TResult>('DELETE', path);
}
