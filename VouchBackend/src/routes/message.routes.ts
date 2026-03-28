import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../validators/message.schema';

const router = Router();

router.use(authenticate);

router.get('/:chatId', chatController.getMessages);
router.post('/:chatId', validate(sendMessageSchema), chatController.sendMessage);

export default router;
