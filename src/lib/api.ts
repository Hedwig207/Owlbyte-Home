// fetch 封装：统一 baseURL、credentials、access token 注入、401 自动 refresh
// Phase A：暂不调真后端，仅留骨架；Phase B 起接入 Cloudflare Functions

import { API_BASE } from './consts';
import type { ApiError, RefreshResponse } from './types';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  // 是否需要鉴权（自动附 access token）
  auth?: boolean;
  // 是否跳过 401 自动 refresh（避免循环）
  skipRefresh?: boolean;
};

// access token 存内存（被 authStore 设置；Phase C 接入）
let _accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  _accessToken = token;
}

function buildUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export class ApiRequestError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  if (!res.ok) {
    const err = data as ApiError | null;
    const code = err?.error?.code ?? 'UNKNOWN';
    const message = err?.error?.message ?? `请求失败 (${res.status})`;
    throw new ApiRequestError(code, message, res.status);
  }
  return data as T;
}

async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(buildUrl('/api/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json() as RefreshResponse;
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = false, skipRefresh = false } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (auth && _accessToken) {
    finalHeaders['Authorization'] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(buildUrl(path), {
    method,
    headers: finalHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
    credentials: 'include', // 始终带 cookie（refresh token）
  });

  // 401 自动 refresh 重试一次
  if (res.status === 401 && auth && !skipRefresh) {
    const newToken = await refreshToken();
    if (newToken) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
    // refresh 失败 → 抛 401，由上层跳登录
    throw new ApiRequestError('UNAUTHORIZED', '会话已过期，请重新登录', 401);
  }

  return parseResponse<T>(res);
}

// 便捷方法
export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};
