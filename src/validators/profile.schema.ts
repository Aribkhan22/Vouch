import { z } from 'zod';

export const startupProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(100),
    industry: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    description: z.string().min(10).max(500),
  }),
});

export const professionalProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    professionType: z.enum(['LAWYER', 'CA']),
    city: z.string().min(2).max(100),
    experienceYears: z.number().int().min(0).max(60),
    specializations: z.array(z.string().min(1).max(100)).min(1).max(5),
    licenseNumber: z.string().min(3).max(50),
    feeRange: z.string().max(50).optional(),
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
