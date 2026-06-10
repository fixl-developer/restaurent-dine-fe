/**
 * Tiny fetch wrapper around the SmartDine backend.
 *
 * - Attaches the staff JWT (and optional guest token) from the auth store.
 * - Unwraps `{ success, data }` automatically; throws `ApiError` on failure.
 * - On 401 for a staff request, tries to refresh once via `/auth/staff/refresh`
 *   before failing; on refresh failure, logs the user out.
 */
import { env } from '@/config/env';
import type { ApiEnvelope, Paginated } from './types';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  /** Set true for guest endpoints that include `X-Guest-Token`. */
  guestToken?: string;
  /** Skip the staff `Authorization` header entirely. */
  noAuth?: boolean;
  /** Return raw Response instead of unwrapping JSON (used for file downloads). */
  raw?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${env.apiBaseUrl}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

// Hooks the auth store provides to avoid circular import.
let tokenGetter: () => string | null = () => null;
let refreshFn: () => Promise<string | null> = async () => null;
let onUnauthorized: () => void = () => {};

export function configureApiAuth(opts: {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  handleUnauthorized: () => void;
}) {
  tokenGetter = opts.getAccessToken;
  refreshFn = opts.refreshAccessToken;
  onUnauthorized = opts.handleUnauthorized;
}

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, init);
}

async function rawRequest(path: string, options: RequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }
  if (!options.noAuth) {
    const token = tokenGetter();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (options.guestToken) headers['X-Guest-Token'] = options.guestToken;

  const url = buildUrl(path, options.query);
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
    signal: options.signal,
  };

  let response = await doFetch(url, init);

  if (response.status === 401 && !options.noAuth && !options.guestToken) {
    const newToken = await refreshFn();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      response = await doFetch(url, { ...init, headers });
    } else {
      onUnauthorized();
    }
  }

  return response;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await rawRequest(path, options);

  if (options.raw) {
    if (!response.ok) {
      throw new ApiError(response.status, 'RAW_ERROR', response.statusText);
    }
    return response as unknown as T;
  }

  const text = await response.text();
  let payload: ApiEnvelope<T> | undefined;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      throw new ApiError(response.status, 'INVALID_JSON', 'Non-JSON response', text);
    }
  }

  if (!response.ok || !payload || payload.success === false) {
    const err = (payload as { error?: { code?: string; message?: string; details?: unknown } } | undefined)?.error;
    throw new ApiError(
      response.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? response.statusText,
      err?.details,
    );
  }
  return payload.data;
}

export const api = {
  get: <T,>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T = void,>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),

  /** GET that returns a paginated envelope `{ items, meta }`. */
  list: async <T,>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Paginated<T>> => {
    const response = await rawRequest(path, { ...options, method: 'GET' });
    const text = await response.text();
    const json = JSON.parse(text);
    if (!response.ok || json?.success === false) {
      const err = json?.error;
      throw new ApiError(
        response.status,
        err?.code ?? 'HTTP_ERROR',
        err?.message ?? response.statusText,
        err?.details,
      );
    }
    return { items: json.data as T[], meta: json.meta };
  },

  /** Build a fully-qualified URL for browser downloads (PDF, images, exports). */
  url: (path: string, query?: RequestOptions['query']) => buildUrl(path, query),
};
