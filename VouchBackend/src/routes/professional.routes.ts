import { Router } from 'express';
import * as professionalController from '../controllers/professional.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { professionalProfileSchema } from '../validators/profile.schema';

const router = Router();

router.use(authenticate);

router.put(
  '/profile',
  authorize('LAWYER', 'CA'),
  validate(professionalProfileSchema),
  professionalController.upsertProfile,
);
router.get('/profile/:userId', professionalController.getProfile);
router.get('/', professionalController.listDirectory);  // GET /professionals

export default router;
