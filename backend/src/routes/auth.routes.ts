import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { getPreferences, getSessionUser, loginUser, registerUser, resendOtp, resendVerification, updatePreferences, ValidationError, verifyOtp, verifyUser } from '../services/auth.service';

const router = Router();
const clientIp = (request: AuthRequest) => request.ip || request.socket.remoteAddress || 'unknown';
const handleError = (error: unknown, res: any, fallback: string) => {
  if (error instanceof ValidationError) return res.status(400).json({ error: error.message, fields: error.fields });
  return res.status(400).json({ error: error instanceof Error ? error.message : fallback });
};

router.post('/register', async (req, res) => { try { await registerUser(req.body, clientIp(req)); return res.status(201).json({ message: 'Verification email sent.' }); } catch (error) { return handleError(error, res, 'Unable to register'); } });
router.get('/verify', async (req, res) => { try { const token = req.query.token; if (typeof token !== 'string') throw new Error('Verification token is required.'); await verifyUser(token); return res.json({ message: 'Email verified successfully.' }); } catch (error) { return handleError(error, res, 'Unable to verify email'); } });
router.post('/verification/resend', async (req, res) => { try { await resendVerification(req.body.email || '', clientIp(req)); return res.json({ message: 'If eligible, a verification email has been sent.' }); } catch (error) { return handleError(error, res, 'Unable to resend verification'); } });
router.post('/login', async (req, res) => { try { return res.json(await loginUser(req.body.email || '', req.body.password || '', clientIp(req))); } catch (error) { return handleError(error, res, 'Unable to log in'); } });
router.post('/otp/verify', async (req, res) => { try { const result = await verifyOtp(req.body.challengeId || '', req.body.code || ''); return res.json({ user: result.user, token: result.token }); } catch (error) { return handleError(error, res, 'Unable to verify code'); } });
router.post('/otp/resend', async (req, res) => { try { return res.json(await resendOtp(req.body.challengeId || '', clientIp(req))); } catch (error) { return handleError(error, res, 'Unable to resend code'); } });
router.get('/session', authenticate, async (req: AuthRequest, res) => { const user = await getSessionUser(req.userId!); return user ? res.json({ user }) : res.status(401).json({ error: 'Unauthorized' }); });
router.get('/preferences', authenticate, async (req: AuthRequest, res) => { try { return res.json({ user: await getPreferences(req.userId!) }); } catch (error) { return handleError(error, res, 'Unable to load settings'); } });
router.patch('/preferences', authenticate, async (req: AuthRequest, res) => { try { return res.json({ user: await updatePreferences(req.userId!, req.body) }); } catch (error) { return handleError(error, res, 'Unable to update settings'); } });
router.post('/logout', (_req, res) => { res.clearCookie('session', { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' }); return res.status(204).send(); });

export default router;
