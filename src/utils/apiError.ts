import axios from 'axios';

export class ApiRequestError extends Error {
  public code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    if (code !== undefined) {
      this.code = code;
    }
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; message?: string; detail?: string }
      | undefined;
    return data?.error || data?.message || data?.detail || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

export function throwApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string; code?: string } | undefined;
    const message = data?.error || data?.message || error.message || 'Request failed';
    throw new ApiRequestError(message, data?.code);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new ApiRequestError('Request failed');
}
