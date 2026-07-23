"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionSchema = exports.splitSchema = void 0;
const zod_1 = require("zod");
const exercise = zod_1.z.object({ id: zod_1.z.string().optional(), name: zod_1.z.string().trim().min(1).max(120), targetSets: zod_1.z.number().int().min(1).max(100), targetReps: zod_1.z.number().int().min(1).max(1000) });
exports.splitSchema = zod_1.z.object({ name: zod_1.z.string().trim().min(1).max(120), color: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/), splitType: zod_1.z.enum(['full_body', 'upper', 'lower', 'anterior', 'posterior', 'push', 'pull', 'legs', 'custom']).optional(), exercises: zod_1.z.array(exercise).min(1).max(100), isActive: zod_1.z.boolean().optional() });
exports.sessionSchema = zod_1.z.object({ splitId: zod_1.z.string().min(1), date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/), notes: zod_1.z.string().max(2000).optional(), exercises: zod_1.z.array(zod_1.z.object({ exerciseId: zod_1.z.string().min(1), weight: zod_1.z.number().finite().min(0), weightUnit: zod_1.z.enum(['kg', 'lb']), reps: zod_1.z.number().int().min(0).max(1000), rpe: zod_1.z.number().min(1).max(10).optional() })).min(1) });
