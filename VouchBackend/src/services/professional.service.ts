import { ProfessionalProfile } from '../models/ProfessionalProfile';

export const upsertProfessionalProfile = async (
  userId: string,
  data: {
    fullName: string;
    professionType: 'LAWYER' | 'CA';
    city: string;
    experienceYears: number;
    specializations: string[];
    licenseNumber: string;
    feeRange?: string;
  },
) => {
  const profile = await ProfessionalProfile.findOneAndUpdate(
    { userId },
    { ...data, userId },
    { new: true, upsert: true, runValidators: true },
  );
  return profile;
};

export const getProfessionalProfile = async (userId: string) => {
  const profile = await ProfessionalProfile.findOne({ userId });
  if (!profile) throw Object.assign(new Error('Professional profile not found.'), { statusCode: 404 });
  return profile;
};

export const listProfessionals = async (filters: {
  city?: string;
  type?: 'LAWYER' | 'CA';
  specialization?: string;
  verified?: boolean;
  page: number;
  limit: number;
}) => {
  const query: Record<string, unknown> = {};
  if (filters.city) query.city = new RegExp(filters.city, 'i');
  if (filters.type) query.professionType = filters.type;
  if (filters.specialization) query.specializations = filters.specialization;
  if (filters.verified === true) query.isVerified = true;

  const skip = (filters.page - 1) * filters.limit;
  const [results, total] = await Promise.all([
    ProfessionalProfile.find(query)
      .skip(skip)
      .limit(filters.limit)
      .sort({ createdAt: -1 }),
    ProfessionalProfile.countDocuments(query),
  ]);
  return { results, total, page: filters.page, limit: filters.limit };
};
