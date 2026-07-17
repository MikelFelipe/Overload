"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_service_1 = require("../services/auth.service");
const router = (0, express_1.Router)();
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' };
const clientIp = (request) => request.ip || request.socket.remoteAddress || 'unknown';
const handleError = (error, res, fallback) => {
    if (error instanceof auth_service_1.ValidationError)
        return res.status(400).json({ error: error.message, fields: error.fields });
    return res.status(400).json({ error: error instanceof Error ? error.message : fallback });
};
router.post('/register', async (req, res) => { try {
    await (0, auth_service_1.registerUser)(req.body, clientIp(req));
    return res.status(201).json({ message: 'Verification email sent.' });
}
catch (error) {
    return handleError(error, res, 'Unable to register');
} });
router.get('/verify', async (req, res) => { try {
    const token = req.query.token;
    if (typeof token !== 'string')
        throw new Error('Verification token is required.');
    await (0, auth_service_1.verifyUser)(token);
    return res.json({ message: 'Email verified successfully.' });
}
catch (error) {
    return handleError(error, res, 'Unable to verify email');
} });
router.post('/verification/resend', async (req, res) => { try {
    await (0, auth_service_1.resendVerification)(req.body.email || '', clientIp(req));
    return res.json({ message: 'If eligible, a verification email has been sent.' });
}
catch (error) {
    return handleError(error, res, 'Unable to resend verification');
} });
router.post('/login', async (req, res) => { try {
    return res.json(await (0, auth_service_1.loginUser)(req.body.email || '', req.body.password || '', clientIp(req)));
}
catch (error) {
    return handleError(error, res, 'Unable to log in');
} });
router.post('/otp/verify', async (req, res) => { try {
    const result = await (0, auth_service_1.verifyOtp)(req.body.challengeId || '', req.body.code || '');
    res.cookie('session', result.token, cookieOptions);
    return res.json({ user: result.user });
}
catch (error) {
    return handleError(error, res, 'Unable to verify code');
} });
router.post('/otp/resend', async (req, res) => { try {
    return res.json(await (0, auth_service_1.resendOtp)(req.body.challengeId || '', clientIp(req)));
}
catch (error) {
    return handleError(error, res, 'Unable to resend code');
} });
router.get('/session', auth_middleware_1.authenticate, async (req, res) => { const user = await (0, auth_service_1.getSessionUser)(req.userId); return user ? res.json({ user }) : res.status(401).json({ error: 'Unauthorized' }); });
router.post('/logout', (_req, res) => { res.clearCookie('session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' }); return res.status(204).send(); });
exports.default = router;
