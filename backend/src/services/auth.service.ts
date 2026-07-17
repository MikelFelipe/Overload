import { createHash, randomBytes, randomInt, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { authChallengesContainer, pendingRegistrationsContainer, usersContainer } from '../config/cosmos';
import { PendingRegistration, User } from '../models/user.model';
import { hashPassword, verifyPassword } from '../utils/hash';

const JWT_SECRET = process.env.JWT_SECRET!;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@overload.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const hasSmtpConfiguration = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
const FIFTEEN_MINUTES = 15 * 60;

const transporter = nodemailer.createTransport(hasSmtpConfiguration
  ? { host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } }
  : { jsonTransport: true } as any);

const now = () => new Date();
const expiresIn = (milliseconds: number) => new Date(Date.now() + milliseconds).toISOString();
const isExpired = (value?: string) => Boolean(value && new Date(value) < now());
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const clientKey = (email: string, ip: string) => `${normalizeEmail(email)}:${ip}`;

const queryOne = async <T>(container: typeof usersContainer, query: string, parameters: { name: string; value: string }[]) => {
  const { resources } = await container.items.query<T>({ query, parameters }).fetchAll();
  return resources[0];
};

const validateRegistration = (data: RegisterData) => {
  const errors: Record<string, string> = {};
  if (!data.firstName.trim()) errors.firstName = 'First name is required.';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) errors.email = 'Enter a valid email address.';
  if (!/^[+()\d\s-]{7,25}$/.test(data.phoneNumber.trim())) errors.phoneNumber = 'Enter a valid phone number.';
  if (data.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (!/[A-Z]/.test(data.password) || !/[a-z]/.test(data.password) || !/\d/.test(data.password) || !/[^A-Za-z0-9]/.test(data.password)) {
    errors.password = 'Password needs uppercase, lowercase, number, and special character.';
  }
  if (Object.keys(errors).length) throw new ValidationError(errors);
};

const sendMail = async (to: string, subject: string, html: string, devUrl?: string) => {
  const mailOptions = { from: EMAIL_FROM, to, subject, html };
  const info = await transporter.sendMail(mailOptions);
  if (!hasSmtpConfiguration) console.log('Development email:', devUrl || info.messageId);
};

const sendVerificationEmail = async (pending: PendingRegistration, rawToken: string) => {
  const url = `${FRONTEND_URL}/verify?token=${encodeURIComponent(rawToken)}`;
  await sendMail(pending.email, 'Verify your Overload account', `<p>Hi ${pending.firstName},</p><p><a href="${url}">Verify your email</a></p><p>This link expires in 24 hours.</p>`, url);
};

const sendOtpEmail = async (email: string, code: string) => {
  await sendMail(email, 'Your Overload sign-in code', `<p>Your sign-in code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`);
};

const recordAttempt = async (kind: string, email: string, ip: string, limit: number) => {
  const key = clientKey(email, ip);
  const { resources } = await authChallengesContainer.items.query<{ id: string }>({
    query: 'SELECT c.id FROM c WHERE c.docType = @kind AND c.key = @key',
    parameters: [{ name: '@kind', value: `rate:${kind}` }, { name: '@key', value: key }],
  }).fetchAll();
  if (resources.length >= limit) throw new Error('Too many requests. Please try again later.');
  await authChallengesContainer.items.create({ id: `rate_${randomUUID()}`, partitionKey: key, key, docType: `rate:${kind}`, ttl: FIFTEEN_MINUTES, createdAt: now().toISOString() });
};

interface RegisterData { firstName: string; lastName: string; middleName?: string; email: string; phoneNumber: string; password: string; }

export class ValidationError extends Error {
  constructor(public readonly fields: Record<string, string>) { super('Validation failed'); }
}

export const registerUser = async (data: RegisterData, ip: string) => {
  validateRegistration(data);
  const email = normalizeEmail(data.email);
  await recordAttempt('register', email, ip, 5);
  const existingUser = await queryOne<User>(usersContainer, 'SELECT * FROM c WHERE c.email = @email', [{ name: '@email', value: email }]);
  if (existingUser) throw new Error('An account with this email already exists.');
  const existingPending = await queryOne<PendingRegistration>(pendingRegistrationsContainer, 'SELECT * FROM c WHERE c.email = @email', [{ name: '@email', value: email }]);
  if (existingPending && !isExpired(existingPending.verificationTokenExpiresAt)) throw new Error('A verification email was already sent. Please check your inbox or resend it.');
  if (existingPending) await pendingRegistrationsContainer.item(existingPending.id, existingPending.partitionKey).delete().catch(() => undefined);
  const token = randomBytes(32).toString('hex');
  const createdAt = now().toISOString();
  const pending: PendingRegistration = {
    id: `pending_${randomUUID()}`, partitionKey: email, email, firstName: data.firstName.trim(), lastName: data.lastName.trim(), middleName: data.middleName?.trim() || undefined,
    phoneNumber: data.phoneNumber.trim(), passwordHash: await hashPassword(data.password), verificationTokenHash: digest(token), verificationTokenExpiresAt: expiresIn(24 * 60 * 60 * 1000),
    resendAvailableAt: expiresIn(60 * 1000), createdAt, ttl: 24 * 60 * 60,
  };
  await pendingRegistrationsContainer.items.create(pending);
  await sendVerificationEmail(pending, token);
};

export const resendVerification = async (emailValue: string, ip: string) => {
  const email = normalizeEmail(emailValue);
  await recordAttempt('verification-resend', email, ip, 3);
  const pending = await queryOne<PendingRegistration>(pendingRegistrationsContainer, 'SELECT * FROM c WHERE c.email = @email', [{ name: '@email', value: email }]);
  if (!pending) return;
  if (isExpired(pending.verificationTokenExpiresAt)) {
    await pendingRegistrationsContainer.item(pending.id, pending.partitionKey).delete().catch(() => undefined);
    return;
  }
  if (new Date(pending.resendAvailableAt) > now()) throw new Error('Please wait before requesting another verification email.');
  const token = randomBytes(32).toString('hex');
  pending.verificationTokenHash = digest(token);
  pending.verificationTokenExpiresAt = expiresIn(24 * 60 * 60 * 1000);
  pending.resendAvailableAt = expiresIn(60 * 1000);
  await pendingRegistrationsContainer.item(pending.id, pending.partitionKey).replace(pending);
  await sendVerificationEmail(pending, token);
};

export const verifyUser = async (token: string) => {
  const pending = await queryOne<PendingRegistration>(pendingRegistrationsContainer, 'SELECT * FROM c WHERE c.verificationTokenHash = @token', [{ name: '@token', value: digest(token) }]);
  if (!pending || isExpired(pending.verificationTokenExpiresAt)) {
    if (pending) await pendingRegistrationsContainer.item(pending.id, pending.partitionKey).delete().catch(() => undefined);
    throw new Error('This verification link is invalid or has expired.');
  }
  const userId = `user_${randomUUID()}`;
  const timestamp = now().toISOString();
  const user: User = { id: userId, userId, email: pending.email, name: `${pending.firstName} ${pending.lastName}`, firstName: pending.firstName, lastName: pending.lastName, middleName: pending.middleName,
    phoneNumber: pending.phoneNumber, passwordHash: pending.passwordHash, unitPreference: 'kg', createdAt: timestamp, updatedAt: timestamp, emailVerified: true, failedLoginCount: 0 };
  await usersContainer.items.create(user);
  await pendingRegistrationsContainer.item(pending.id, pending.partitionKey).delete();
  return user;
};

export const loginUser = async (emailValue: string, password: string, ip: string) => {
  const email = normalizeEmail(emailValue);
  await recordAttempt('login', email, ip, 10);
  const user = await queryOne<User>(usersContainer, 'SELECT * FROM c WHERE c.email = @email', [{ name: '@email', value: email }]);
  const invalid = new Error('Invalid email or password.');
  if (user && user.lockoutExpiresAt && !isExpired(user.lockoutExpiresAt)) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }
  if (user && user.lockoutExpiresAt && isExpired(user.lockoutExpiresAt)) {
    user.lockoutExpiresAt = undefined;
    user.failedLoginCount = 0;
    user.updatedAt = now().toISOString();
    await usersContainer.item(user.id, user.userId).replace(user);
  }
  if (!user || !await verifyPassword(password, user.passwordHash)) {
    if (user) {
      user.failedLoginCount += 1;
      if (user.failedLoginCount >= 5) user.lockoutExpiresAt = expiresIn(15 * 60 * 1000);
      user.updatedAt = now().toISOString();
      await usersContainer.item(user.id, user.userId).replace(user);
    }
    throw invalid;
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const challengeId = `otp_${randomUUID()}`;
  await authChallengesContainer.items.create({ id: challengeId, partitionKey: email, docType: 'otp', email, codeHash: digest(code), attempts: 0, used: false, resendAvailableAt: expiresIn(60 * 1000), createdAt: now().toISOString(), ttl: 5 * 60 });
  await sendOtpEmail(email, code);
  return { challengeId };
};

export const verifyOtp = async (challengeId: string, code: string) => {
  const challenge = await queryOne<any>(authChallengesContainer, 'SELECT * FROM c WHERE c.id = @id AND c.docType = @type', [{ name: '@id', value: challengeId }, { name: '@type', value: 'otp' }]);
  if (!challenge || challenge.used || challenge.codeHash !== digest(code)) {
    if (challenge && !challenge.used) { challenge.attempts += 1; if (challenge.attempts >= 5) challenge.used = true; await authChallengesContainer.item(challenge.id, challenge.partitionKey).replace(challenge); }
    throw new Error('Invalid or expired verification code.');
  }
  challenge.used = true;
  await authChallengesContainer.item(challenge.id, challenge.partitionKey).replace(challenge);
  const user = await queryOne<User>(usersContainer, 'SELECT * FROM c WHERE c.email = @email', [{ name: '@email', value: challenge.email }]);
  if (!user) throw new Error('Invalid or expired verification code.');
  user.failedLoginCount = 0; user.lockoutExpiresAt = undefined; user.lastLoginDate = now().toISOString(); user.updatedAt = user.lastLoginDate;
  await usersContainer.item(user.id, user.userId).replace(user);
  return { token: jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '7d' }), user: { userId: user.userId, name: user.name, email: user.email, unitPreference: user.unitPreference } };
};

export const resendOtp = async (challengeId: string, ip: string) => {
  const challenge = await queryOne<any>(authChallengesContainer, 'SELECT * FROM c WHERE c.id = @id AND c.docType = @type', [{ name: '@id', value: challengeId }, { name: '@type', value: 'otp' }]);
  if (!challenge || challenge.used || new Date(challenge.resendAvailableAt) > now()) throw new Error('Please wait before requesting another code.');
  await recordAttempt('otp-resend', challenge.email, ip, 3);
  challenge.used = true;
  await authChallengesContainer.item(challenge.id, challenge.partitionKey).replace(challenge);
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const nextId = `otp_${randomUUID()}`;
  await authChallengesContainer.items.create({ ...challenge, id: nextId, codeHash: digest(code), attempts: 0, used: false, resendAvailableAt: expiresIn(60 * 1000), createdAt: now().toISOString(), ttl: 5 * 60 });
  await sendOtpEmail(challenge.email, code);
  return { challengeId: nextId };
};

export const getSessionUser = async (userId: string) => {
  const user = await queryOne<User>(usersContainer, 'SELECT * FROM c WHERE c.userId = @userId', [{ name: '@userId', value: userId }]);
  if (!user) return undefined;
  return { userId: user.userId, name: user.name, email: user.email, unitPreference: user.unitPreference };
};
