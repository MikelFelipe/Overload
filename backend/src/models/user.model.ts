export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  unitPreference: 'kg' | 'lbs';
  createdAt: string;
  updatedAt: string;
  lastLoginDate?: string;
}

export interface PendingRegistration {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  verificationTokenHash: string;
  verificationTokenExpiresAt: string;
  resendAvailableAt: string;
  createdAt: string;
}
