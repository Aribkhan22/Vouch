import { z } from 'zod';

export const startupProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name cannot exceed 100 characters'),
    industry: z.string().min(2, 'Industry must be at least 2 characters').max(100, 'Industry cannot exceed 100 characters'),
    city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City cannot exceed 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description cannot exceed 500 characters'),
  }),
});

export const professionalProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters'),
    professionType: z.enum(['LAWYER', 'CA'], { errorMap: () => ({ message: 'Please select a valid profession type (LAWYER or CA)' }) }),
    city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City cannot exceed 100 characters'),
    experienceYears: z.number().int().min(0, 'Experience years cannot be negative').max(60, 'Experience years cannot exceed 60'),
    specializations: z.array(z.string().min(1, 'Specialization cannot be empty').max(100, 'Specialization cannot exceed 100 characters')).min(1, 'Please select at least one specialization').max(5, 'Cannot select more than 5 specializations'),
    licenseNumber: z.string().min(3, 'License number must be at least 3 characters').max(50, 'License number cannot exceed 50 characters'),
    feeRange: z.string().max(50, 'Fee range cannot exceed 50 characters').optional(),
  }),
});

export const directoryQuerySchema = z.object({
  query: z.object({
    city: z.string().optional(),
    type: z.enum(['LAWYER', 'CA']).optional(),
    specialization: z.string().optional(),
    verified: z
      .string()
      .optional()
      .transform((v) => v !== 'false'),
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Math.min(parseInt(v, 10), 50) : 20)),
  }),
});
