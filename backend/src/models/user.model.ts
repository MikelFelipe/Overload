export interface User {
  id: string;
  userId: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  passwordHash: string;
  unitPreference: 'kg' | 'lbs';
  createdAt: string;
  updatedAt: string;
  emailVerified: true;
  lastLoginDate?: string;
  failedLoginCount: number;
  lockoutExpiresAt?: string;
}

export interface PendingRegistration {
  id: string;
  partitionKey: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  passwordHash: string;
  verificationTokenHash: string;
  verificationTokenExpiresAt: string;
  resendAvailableAt: string;
  createdAt: string;
  ttl: number;
}
