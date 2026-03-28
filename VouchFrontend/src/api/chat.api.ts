import { apiClient } from './client';
import { ApiResponse, Chat, Message, PaginatedResponse } from '@types/index';

export const chatApi = {
  getByRequest: (requestId: string) =>
    apiClient.get<ApiResponse<Chat>>(`/chats/by-request/${requestId}`),

  getMessages: (chatId: string, page = 1, limit = 30) =>
    apiClient.get<ApiResponse<PaginatedResponse<Message> & { messages: Message[] }>>(
      `/messages/${chatId}`,
      { params: { page, limit } },
    ),

  sendMessage: (chatId: string, text: string) =>
    apiClient.post<ApiResponse<Message>>(`/messages/${chatId}`, { text }),
};
