import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../utils/constants';

export const createRequestSchema = z.object({
  body: z.object({
    category: z.enum(SERVICE_CATEGORIES),
    description: z.string().min(20).max(1000),
    city: z.string().min(2).max(100),
    budgetRange: z.string().min(1).max(100),
  }),
});
