import { Router } from 'express';
import * as startupController from '../controllers/startup.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { startupProfileSchema } from '../validators/profile.schema';

const router = Router();

router.use(authenticate);

router.put(
  '/profile',
  authorize('STARTUP'),
  validate(startupProfileSchema),
  startupController.upsertProfile,
);
router.get('/profile/:userId', startupController.getProfile);

export default router;
