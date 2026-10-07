import axios from 'axios';
import { apiPrefix } from '@/config/api';
let token: string | null = null;
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
/** Auth is memory-only; this is the sole HTTP transport/auth-header owner. */
export function setSessionToken(value: string | null) {
  token = value;
}
export async function apiClient<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000';
  try {
    const result = await axios.request<T>({
      method,
      url:
        base.replace(/\/$/, '') +
        '/' +
        apiPrefix.replace(/^\/|\/$/g, '') +
        '/' +
        path,
      data: body,
      signal,
      timeout: 10000,
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    });
    return result.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    if (axios.isAxiosError<{ error?: { code?: string } }>(error)) {
      const code = error.response?.data.error?.code ?? 'NETWORK_ERROR';
      if (error.response?.status === 401) {
        token = null;
        if (typeof window !== 'undefined')
          window.dispatchEvent(new Event('auth:expired'));
      }
      throw new ApiError(code, error.response?.status ?? 0);
    }
    throw new ApiError('INTERNAL_ERROR', 0);
  }
}
