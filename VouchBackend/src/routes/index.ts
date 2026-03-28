import { Router } from 'express';
import authRoutes from './auth.routes';
import startupRoutes from './startup.routes';
import professionalRoutes from './professional.routes';
import verificationRoutes from './verification.routes';
import requestRoutes from './request.routes';
import chatRoutes from './chat.routes';
import messageRoutes from './message.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/startup', startupRoutes);
router.use('/professional', professionalRoutes);
router.use('/professionals', professionalRoutes);
router.use('/professional/verification', verificationRoutes);
router.use('/requests', requestRoutes);
router.use('/chats', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);

export default router;
