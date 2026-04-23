import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../utils/constants';

export const createRequestSchema = z.object({
  body: z.object({
    category: z.enum(SERVICE_CATEGORIES, { errorMap: () => ({ message: 'Please select a valid service category' }) }),
    description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description cannot exceed 1000 characters'),
    city: z.string().min(2, 'City name must be at least 2 characters').max(100, 'City name cannot exceed 100 characters'),
    budgetRange: z.string().min(1, 'Budget range is required').max(100, 'Budget range cannot exceed 100 characters'),
  }),
});
