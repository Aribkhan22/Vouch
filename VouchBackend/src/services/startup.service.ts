import { StartupProfile } from '../models/StartupProfile';

export const upsertStartupProfile = async (
  userId: string,
  data: {
    companyName: string;
    industry: string;
    city: string;
    description: string;
  },
) => {
  const profile = await StartupProfile.findOneAndUpdate(
    { userId },
    { ...data, userId },
    { new: true, upsert: true, runValidators: true },
  );
  return profile;
};

export const getStartupProfile = async (userId: string) => {
  const profile = await StartupProfile.findOne({ userId });
  if (!profile) throw Object.assign(new Error('Startup profile not found.'), { statusCode: 404 });
  return profile;
};
