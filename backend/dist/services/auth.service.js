"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionUser = exports.resendOtp = exports.verifyOtp = exports.loginUser = exports.verifyUser = exports.resendVerification = exports.registerUser = exports.ValidationError = void 0;
const crypto_1 = require("crypto");
const nodemailer_1 = __importDefault(require("nodemailer"));
require("../config/env");
const supabase_1 = require("../config/supabase");
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@overload.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const hasSmtpConfiguration = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const transporter = nodemailer_1.default.createTransport(hasSmtpConfiguration ? { host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } } : { jsonTransport: true });
const now = () => new Date();
const expiresIn = (milliseconds) => new Date(Date.now() + milliseconds).toISOString();
const isExpired = (value) => Boolean(value && new Date(value) < now());
const digest = (value) => (0, crypto_1.createHash)('sha256').update(value).digest('hex');
const normalizeEmail = (email) => email.trim().toLowerCase();
const clientKey = (email, ip) => `${normalizeEmail(email)}:${ip}`;
const dbError = (error) => { if (error)
    throw new Error(error.message); };
const toPending = (row) => ({ id: row.id, email: row.email, firstName: row.first_name, lastName: row.last_name, middleName: row.middle_name || undefined, phoneNumber: row.phone_number, verificationTokenHash: row.verification_token_hash, verificationTokenExpiresAt: row.verification_token_expires_at, resendAvailableAt: row.resend_available_at, createdAt: row.created_at });
const toProfile = (row) => ({ id: row.id, email: row.email, name: row.name, firstName: row.first_name, lastName: row.last_name, middleName: row.middle_name || undefined, phoneNumber: row.phone_number, unitPreference: row.unit_preference, createdAt: row.created_at, updatedAt: row.updated_at, lastLoginDate: row.last_login_date || undefined });
const sendMail = async (to, subject, html, devUrl) => { const info = await transporter.sendMail({ from: EMAIL_FROM, to, subject, html }); if (!hasSmtpConfiguration)
    console.log('Development email:', devUrl || info.messageId); };
const sendVerificationEmail = async (pending, token) => sendMail(pending.email, 'Verify your Overload account', `<p>Hi ${pending.firstName},</p><p><a href="${FRONTEND_URL}/verify?token=${encodeURIComponent(token)}">Verify your email</a></p><p>This link expires in 24 hours.</p>`);
const sendOtpEmail = async (email, code) => sendMail(email, 'Your Overload sign-in code', `<p>Your sign-in code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`);
const recordAttempt = async (email, ip, limit) => { const db = (0, supabase_1.getSupabase)(); const key = clientKey(email, ip); const cutoff = new Date(Date.now() - FIFTEEN_MINUTES).toISOString(); await db.from('auth_challenges').delete().eq('kind', 'rate').lt('expires_at', now().toISOString()); const { count, error } = await db.from('auth_challenges').select('*', { count: 'exact', head: true }).eq('kind', 'rate').eq('rate_key', key).gte('created_at', cutoff); dbError(error); if ((count || 0) >= limit)
    throw new Error('Too many requests. Please try again later.'); dbError((await db.from('auth_challenges').insert({ id: `rate_${(0, crypto_1.randomUUID)()}`, kind: 'rate', rate_key: key, expires_at: expiresIn(FIFTEEN_MINUTES) })).error); };
class ValidationError extends Error {
    constructor(fields) {
        super('Validation failed');
        this.fields = fields;
    }
}
exports.ValidationError = ValidationError;
const validateRegistration = (data) => { const errors = {}; if (!data.firstName?.trim())
    errors.firstName = 'First name is required.'; if (!data.lastName?.trim())
    errors.lastName = 'Last name is required.'; if (!/^\S+@\S+\.\S+$/.test(data.email?.trim() || ''))
    errors.email = 'Enter a valid email address.'; if (!/^[+()\d\s-]{7,25}$/.test(data.phoneNumber?.trim() || ''))
    errors.phoneNumber = 'Enter a valid phone number.'; if ((data.password || '').length < 8)
    errors.password = 'Password must be at least 8 characters.';
else if (!/[A-Z]/.test(data.password) || !/[a-z]/.test(data.password) || !/\d/.test(data.password) || !/[^A-Za-z0-9]/.test(data.password))
    errors.password = 'Password needs uppercase, lowercase, number, and special character.'; if (Object.keys(errors).length)
    throw new ValidationError(errors); };
const registerUser = async (data, ip) => { validateRegistration(data); const db = (0, supabase_1.getSupabase)(); const email = normalizeEmail(data.email); await recordAttempt(email, ip, 5); const { data: existing } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 }); if (existing.users.some((user) => user.email?.toLowerCase() === email))
    throw new Error('An account with this email already exists.'); const { data: authData, error: authError } = await db.auth.admin.createUser({ email, password: data.password, email_confirm: false }); dbError(authError); if (!authData.user)
    throw new Error('Supabase did not create the account.'); const authUser = authData.user; const token = (0, crypto_1.randomBytes)(32).toString('hex'); const pending = { id: authUser.id, email, firstName: data.firstName.trim(), lastName: data.lastName.trim(), middleName: data.middleName?.trim() || undefined, phoneNumber: data.phoneNumber.trim(), verificationTokenHash: digest(token), verificationTokenExpiresAt: expiresIn(86400000), resendAvailableAt: expiresIn(60000), createdAt: now().toISOString() }; const { error } = await db.from('pending_registrations').insert({ id: pending.id, email: pending.email, first_name: pending.firstName, last_name: pending.lastName, middle_name: pending.middleName || null, phone_number: pending.phoneNumber, verification_token_hash: pending.verificationTokenHash, verification_token_expires_at: pending.verificationTokenExpiresAt, resend_available_at: pending.resendAvailableAt, created_at: pending.createdAt }); if (error) {
    await db.auth.admin.deleteUser(authUser.id);
    dbError(error);
} await sendVerificationEmail(pending, token); };
exports.registerUser = registerUser;
const resendVerification = async (emailValue, ip) => { const db = (0, supabase_1.getSupabase)(); const email = normalizeEmail(emailValue); await recordAttempt(email, ip, 3); const { data, error } = await db.from('pending_registrations').select('*').eq('email', email).maybeSingle(); dbError(error); if (!data)
    return; const pending = toPending(data); if (isExpired(pending.verificationTokenExpiresAt)) {
    await db.auth.admin.deleteUser(pending.id);
    dbError((await db.from('pending_registrations').delete().eq('id', pending.id)).error);
    return;
} if (new Date(pending.resendAvailableAt) > now())
    throw new Error('Please wait before requesting another verification email.'); const token = (0, crypto_1.randomBytes)(32).toString('hex'); dbError((await db.from('pending_registrations').update({ verification_token_hash: digest(token), verification_token_expires_at: expiresIn(86400000), resend_available_at: expiresIn(60000) }).eq('id', pending.id)).error); await sendVerificationEmail(pending, token); };
exports.resendVerification = resendVerification;
const verifyUser = async (token) => { const db = (0, supabase_1.getSupabase)(); const { data, error } = await db.from('pending_registrations').select('*').eq('verification_token_hash', digest(token)).maybeSingle(); dbError(error); if (!data)
    throw new Error('This verification link is invalid or has expired.'); const pending = toPending(data); if (isExpired(pending.verificationTokenExpiresAt)) {
    await db.auth.admin.deleteUser(pending.id);
    await db.from('pending_registrations').delete().eq('id', pending.id);
    throw new Error('This verification link is invalid or has expired.');
} dbError((await db.auth.admin.updateUserById(pending.id, { email_confirm: true })).error); dbError((await db.from('profiles').insert({ id: pending.id, email: pending.email, name: `${pending.firstName} ${pending.lastName}`, first_name: pending.firstName, last_name: pending.lastName, middle_name: pending.middleName || null, phone_number: pending.phoneNumber })).error); dbError((await db.from('pending_registrations').delete().eq('id', pending.id)).error); };
exports.verifyUser = verifyUser;
const loginUser = async (emailValue, password, ip) => { const db = (0, supabase_1.getSupabase)(); const email = normalizeEmail(emailValue); await recordAttempt(email, ip, 10); const { data, error } = await db.auth.signInWithPassword({ email, password }); if (error || !data.session || !data.user)
    throw new Error('Invalid email or password.'); const code = String((0, crypto_1.randomInt)(0, 1000000)).padStart(6, '0'); const challengeId = `otp_${(0, crypto_1.randomUUID)()}`; dbError((await db.from('auth_challenges').insert({ id: challengeId, kind: 'otp', email, code_hash: digest(code), attempts: 0, used: false, resend_available_at: expiresIn(60000), expires_at: expiresIn(300000), access_token: data.session.access_token })).error); await sendOtpEmail(email, code); return { challengeId }; };
exports.loginUser = loginUser;
const findChallenge = async (id) => { const { data, error } = await (0, supabase_1.getSupabase)().from('auth_challenges').select('*').eq('id', id).eq('kind', 'otp').maybeSingle(); dbError(error); return data; };
const verifyOtp = async (challengeId, code) => { const db = (0, supabase_1.getSupabase)(); const challenge = await findChallenge(challengeId); if (!challenge || challenge.used || isExpired(challenge.expires_at) || challenge.code_hash !== digest(code)) {
    if (challenge && !challenge.used)
        await db.from('auth_challenges').update({ attempts: challenge.attempts + 1, used: challenge.attempts + 1 >= 5 }).eq('id', challenge.id);
    throw new Error('Invalid or expired verification code.');
} dbError((await db.from('auth_challenges').update({ used: true }).eq('id', challenge.id)).error); const { data: authData, error: authError } = await db.auth.getUser(challenge.access_token); if (authError || !authData.user)
    throw new Error('Your sign-in session expired. Please log in again.'); const { data, error } = await db.from('profiles').select('*').eq('id', authData.user.id).maybeSingle(); dbError(error); if (!data)
    throw new Error('Account profile not found.'); dbError((await db.from('profiles').update({ last_login_date: now().toISOString() }).eq('id', authData.user.id)).error); const user = toProfile(data); return { token: challenge.access_token, user: { userId: user.id, name: user.name, email: user.email, unitPreference: user.unitPreference } }; };
exports.verifyOtp = verifyOtp;
const resendOtp = async (challengeId, ip) => { const db = (0, supabase_1.getSupabase)(); const challenge = await findChallenge(challengeId); if (!challenge || challenge.used || isExpired(challenge.expires_at) || new Date(challenge.resend_available_at) > now())
    throw new Error('Please wait before requesting another code.'); await recordAttempt(challenge.email, ip, 3); dbError((await db.from('auth_challenges').update({ used: true }).eq('id', challenge.id)).error); const code = String((0, crypto_1.randomInt)(0, 1000000)).padStart(6, '0'); const nextId = `otp_${(0, crypto_1.randomUUID)()}`; dbError((await db.from('auth_challenges').insert({ id: nextId, kind: 'otp', email: challenge.email, code_hash: digest(code), attempts: 0, used: false, resend_available_at: expiresIn(60000), expires_at: expiresIn(300000), access_token: challenge.access_token })).error); await sendOtpEmail(challenge.email, code); return { challengeId: nextId }; };
exports.resendOtp = resendOtp;
const getSessionUser = async (userId) => { const { data, error } = await (0, supabase_1.getSupabase)().from('profiles').select('*').eq('id', userId).maybeSingle(); dbError(error); if (!data)
    return undefined; const user = toProfile(data); return { userId: user.id, name: user.name, email: user.email, unitPreference: user.unitPreference }; };
exports.getSessionUser = getSessionUser;
