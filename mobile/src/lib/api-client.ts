import { tokenStorage } from './storage';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await tokenStorage.get();
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  const body = await response.json().catch(() => null);
  if (!response.ok) { const error = new Error(body?.error || 'Request failed.') as Error & { fields?: Record<string, string> }; error.fields = body?.fields; throw error; }
  return body as T;
}
