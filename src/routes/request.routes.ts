import { Router } from 'express';
import * as requestController from '../controllers/request.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createRequestSchema } from '../validators/request.schema';

const router = Router();

router.use(authenticate);

router.post('/', authorize('STARTUP'), validate(createRequestSchema), requestController.create);
router.get('/mine', requestController.mine);
router.get('/open', authorize('LAWYER', 'CA'), requestController.open);
router.post('/:id/accept', authorize('LAWYER', 'CA'), requestController.accept);
router.post('/:id/close', authorize('STARTUP'), requestController.close);

export default router;
