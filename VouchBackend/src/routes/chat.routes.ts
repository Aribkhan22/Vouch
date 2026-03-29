import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../validators/message.schema';

const router = Router();

router.use(authenticate);

router.get('/by-request/:requestId', chatController.getChatByRequest);
router.get('/:chatId', chatController.getChat);

export default router;
