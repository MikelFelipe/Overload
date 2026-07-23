import { z } from 'zod';

const exercise = z.object({ id: z.string().optional(), name: z.string().trim().min(1).max(120), targetSets: z.number().int().min(1).max(100), targetReps: z.number().int().min(1).max(1000) });
export const splitSchema = z.object({ name: z.string().trim().min(1).max(120), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), splitType: z.enum(['full_body', 'upper', 'lower', 'anterior', 'posterior', 'push', 'pull', 'legs', 'custom']).optional(), exercises: z.array(exercise).min(1).max(100), isActive: z.boolean().optional() });
export const sessionSchema = z.object({ splitId: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), notes: z.string().max(2000).optional(), exercises: z.array(z.object({ exerciseId: z.string().min(1), weight: z.number().finite().min(0), weightUnit: z.enum(['kg', 'lb']), reps: z.number().int().min(0).max(1000), rpe: z.number().min(1).max(10).optional() })).min(1) });
