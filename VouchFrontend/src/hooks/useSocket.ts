import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@utils/constants';
import { useAppSelector } from '@store/hooks';
import { Message } from '@types/index';

export const useSocket = (chatId: string | null, onNewMessage: (msg: Message) => void) => {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAppSelector(s => s.auth.accessToken);

  useEffect(() => {
    if (!chatId || !accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('chat:join', chatId);
    });

    socket.on('message:new', (msg: Message) => {
      onNewMessage(msg);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId, accessToken, onNewMessage]);

  const sendMessage = useCallback((text: string) => {
    socketRef.current?.emit('message:send', { chatId, text });
  }, [chatId]);

  return { sendMessage };
};
