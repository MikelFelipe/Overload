import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

export const validateBody = (schema: ZodTypeAny): RequestHandler => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request.', fields: result.error.flatten().fieldErrors });
  }
  req.body = result.data;
  return next();
};

export const validateQuery = (schema: ZodTypeAny): RequestHandler => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) return res.status(400).json({ error: 'Invalid query.', fields: result.error.flatten().fieldErrors });
  req.query = result.data;
  return next();
};
