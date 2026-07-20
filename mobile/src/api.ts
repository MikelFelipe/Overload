import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateSessionPayload, DashboardData, OtpVerifyResponse, RegisterPayload, Split, SplitPayload, User } from '@overload/shared';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const tokenKey = 'overload.mobile.token';

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = await AsyncStorage.getItem(tokenKey);
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || 'Request failed.');
  return body as T;
};

export const mobileToken = {
  get: () => AsyncStorage.getItem(tokenKey),
  set: (token: string) => AsyncStorage.setItem(tokenKey, token),
  clear: () => AsyncStorage.removeItem(tokenKey),
};
export const api = {
  register: (payload: RegisterPayload) => request<{ message: string }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (email: string, password: string) => request<{ challengeId: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verifyOtp: (challengeId: string, code: string) => request<OtpVerifyResponse>('/auth/otp/verify', { method: 'POST', headers: { 'X-Client-Platform': 'mobile' }, body: JSON.stringify({ challengeId, code }) }),
  resendOtp: (challengeId: string) => request<{ challengeId: string }>('/auth/otp/resend', { method: 'POST', body: JSON.stringify({ challengeId }) }),
  resendVerification: (email: string) => request<{ message: string }>('/auth/verification/resend', { method: 'POST', body: JSON.stringify({ email }) }),
  session: () => request<{ user: User }>('/auth/session'),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  dashboard: () => request<DashboardData>('/workouts/dashboard'),
  createSplit: (payload: SplitPayload) => request<Split>('/workouts/splits', { method: 'POST', body: JSON.stringify(payload) }),
  updateSplit: (id: string, payload: SplitPayload) => request<Split>(`/workouts/splits/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  activateSplit: (id: string) => request<Split>(`/workouts/splits/${id}/active`, { method: 'PATCH' }),
  deleteSplit: (id: string) => request<void>(`/workouts/splits/${id}`, { method: 'DELETE' }),
  createSession: (payload: CreateSessionPayload) => request('/workouts/sessions', { method: 'POST', body: JSON.stringify(payload) }),
};
