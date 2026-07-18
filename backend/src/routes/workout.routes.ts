import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as controller from '../controllers/workout.controller';

const router = Router();
router.use(authenticate);
router.get('/dashboard', controller.dashboard);
router.post('/splits', controller.createSplit);
router.put('/splits/:splitId', controller.updateSplit);
router.patch('/splits/:splitId/active', controller.activateSplit);
router.delete('/splits/:splitId', controller.removeSplit);
router.post('/sessions', controller.createSession);
export default router;
