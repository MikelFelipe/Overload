import { CreateSessionPayload, DashboardData, OtpVerifyResponse, RegisterPayload, Split, SplitPayload, User } from '@overload/shared';
import { request } from './api-client';
export const api = {
  register: (payload: RegisterPayload) => request<{ message: string }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmail: (token: string) => request<{ message: string }>(`/auth/verify?token=${encodeURIComponent(token)}`),
  resendVerification: (email: string) => request<{ message: string }>('/auth/verification/resend', { method: 'POST', body: JSON.stringify({ email }) }),
  login: (email: string, password: string) => request<{ challengeId: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verifyOtp: (challengeId: string, code: string) => request<OtpVerifyResponse>('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ challengeId, code }) }),
  resendOtp: (challengeId: string) => request<{ challengeId: string }>('/auth/otp/resend', { method: 'POST', body: JSON.stringify({ challengeId }) }),
  session: () => request<{ user: User }>('/auth/session'), logout: () => request<void>('/auth/logout', { method: 'POST' }),
  dashboard: () => request<DashboardData>('/workouts/dashboard'),
  createSplit: (payload: SplitPayload) => request<Split>('/workouts/splits', { method: 'POST', body: JSON.stringify(payload) }),
  updateSplit: (id: string, payload: SplitPayload) => request<Split>(`/workouts/splits/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  activateSplit: (id: string) => request<Split>(`/workouts/splits/${id}/active`, { method: 'PATCH' }),
  deleteSplit: (id: string) => request<void>(`/workouts/splits/${id}`, { method: 'DELETE' }),
  createSession: (payload: CreateSessionPayload) => request('/workouts/sessions', { method: 'POST', body: JSON.stringify(payload) }),
};
