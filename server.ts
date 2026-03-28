import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './src/app';
import { connectDB } from './src/config/db';
import { env } from './src/config/env';
import { logger } from './src/utils/logger';
import { registerChatSocket } from './src/socket/chatSocket';

const httpServer = http.createServer(app);

const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
  .map((o: string) => o.trim())
  .filter(Boolean);

const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
  },
});

registerChatSocket(io);

const start = async () => {
  await connectDB();
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

start();
