import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { logger } from '../utils/logger';

export const registerChatSocket = (io: Server): void => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.debug(`Socket connected: ${socket.id} user: ${socket.data.user?.userId}`);

    socket.on('chat:join', async (chatId: string) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        const userId = socket.data.user?.userId as string;
        const participants = [
          chat.startupUserId.toString(),
          chat.professionalUserId.toString(),
        ];
        if (!participants.includes(userId)) {
          socket.emit('error', { message: 'Forbidden' });
          return;
        }
        socket.join(chatId);
        socket.emit('chat:joined', { chatId });
      } catch (err) {
        logger.error('chat:join error', { error: err });
        socket.emit('error', { message: 'Internal error' });
      }
    });

    socket.on('message:send', async (payload: { chatId: string; text: string }) => {
      try {
        const { chatId, text } = payload;
        if (!chatId || !text || text.trim().length === 0) {
          socket.emit('error', { message: 'Invalid payload' });
          return;
        }
        if (text.length > 2000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        const userId = socket.data.user?.userId as string;
        const participants = [
          chat.startupUserId.toString(),
          chat.professionalUserId.toString(),
        ];
        if (!participants.includes(userId)) {
          socket.emit('error', { message: 'Forbidden' });
          return;
        }

        const message = await Message.create({
          chatId,
          senderId: userId,
          text: text.trim(),
        });

        io.to(chatId).emit('message:new', message);
      } catch (err) {
        logger.error('message:send error', { error: err });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });
};
