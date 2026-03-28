import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../validators/message.schema';

const router = Router();

router.use(authenticate);

router.get('/by-request/:requestId', chatController.getChatByRequest);
router.get('/messages/:chatId', chatController.getMessages);
router.post(
  '/messages/:chatId',
  validate(sendMessageSchema),
  chatController.sendMessage,
);

export default router;
