import { API_BASE } from '@/shared/config/env';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type ApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

function buildUrl(path: string, params?: Record<string, unknown>) {
  const base = API_BASE.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function request<T>(method: RequestMethod, path: string, options: RequestOptions = {}) {
  const { params, data, headers, signal } = options;
  const url = buildUrl(path, params);

  const init: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    signal,
  };

  if (data !== undefined && method !== 'GET') {
    init.body = JSON.stringify(data);
  }

  const response = await fetch(url, init);
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    const payload = isJson ? await response.json().catch(() => undefined) : undefined;
    const message =
      (typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : undefined) ?? response.statusText;
    throw new Error(message || 'Request failed');
  }

  const dataPayload = (isJson ? await response.json() : await response.text()) as T;

  return {
    data: dataPayload,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  } satisfies ApiResponse<T>;
}

export const api = {
  get<T>(path: string, options?: Omit<RequestOptions, 'data'>) {
    return request<T>('GET', path, options);
  },
  post<T>(path: string, data?: unknown, options?: Omit<RequestOptions, 'data'>) {
    return request<T>('POST', path, { ...options, data });
  },
  put<T>(path: string, data?: unknown, options?: Omit<RequestOptions, 'data'>) {
    return request<T>('PUT', path, { ...options, data });
  },
  patch<T>(path: string, data?: unknown, options?: Omit<RequestOptions, 'data'>) {
    return request<T>('PATCH', path, { ...options, data });
  },
  delete<T>(path: string, options?: Omit<RequestOptions, 'data'>) {
    return request<T>('DELETE', path, options);
  },
};

export function asArray<T>(val: unknown, label: string): T[] {
  if (Array.isArray(val)) {
    return val as T[];
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error(`${label} expected array, got:`, val);
  }

  return [];
}
