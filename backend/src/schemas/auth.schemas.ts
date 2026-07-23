import { z } from 'zod';

const email = z.string().trim().email().max(320);
const password = z.string().min(8).max(200);

export const registerSchema = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), middleName: z.string().trim().max(80).optional(), email, phoneNumber: z.string().regex(/^\d{11}$/), password });
export const loginSchema = z.object({ email, password });
export const verificationResendSchema = z.object({ email });
export const otpVerifySchema = z.object({ challengeId: z.string().min(1).max(200), code: z.string().regex(/^\d{6}$/) });
export const otpResendSchema = z.object({ challengeId: z.string().min(1).max(200) });
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const preferencesSchema = z.object({ name: z.string().trim().min(1).max(160), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), middleName: z.string().trim().max(80).optional(), phoneNumber: z.string().regex(/^\d{11}$/), unitPreference: z.enum(['kg', 'lbs']), weeklyTarget: z.number().int().min(1).max(14), timezone: z.string().min(1).max(100), theme: z.enum(['system', 'light', 'dark']), notificationsEnabled: z.boolean() });
