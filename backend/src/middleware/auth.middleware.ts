import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';

export interface AuthRequest extends Request { userId?: string; user?: unknown; }

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorization = req.header('authorization');
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearerToken || req.cookies?.session;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = data.user.id;
  req.user = data.user;
  return next();
};
