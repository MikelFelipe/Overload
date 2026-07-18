import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as workouts from '../services/workout.service';

const handle = (action: (req: AuthRequest) => Promise<unknown>) => async (req: AuthRequest, res: Response) => {
  try { return res.json(await action(req)); } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'Request failed.' }); }
};

export const dashboard = handle((req) => workouts.listDashboard(req.userId!));
export const createSplit = handle((req) => workouts.createSplit(req.userId!, req.body));
export const updateSplit = handle((req) => workouts.updateSplit(req.userId!, String(req.params.splitId), req.body));
export const activateSplit = handle((req) => workouts.setActiveSplit(req.userId!, String(req.params.splitId)));
export const removeSplit = async (req: AuthRequest, res: Response) => { try { await workouts.deleteSplit(req.userId!, String(req.params.splitId)); return res.status(204).send(); } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'Request failed.' }); } };
export const createSession = handle((req) => workouts.createSession(req.userId!, req.body));
