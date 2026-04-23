import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  }),
});
