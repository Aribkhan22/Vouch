import { Router } from 'express';
import * as verificationController from '../controllers/verification.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadDocs } from '../middleware/uploadMiddleware';

const router = Router();

router.post(
  '/submit',
  authenticate,
  authorize('LAWYER', 'CA'),
  uploadDocs,
  verificationController.submitDocs,
);

export default router;
