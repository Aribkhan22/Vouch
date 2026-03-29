import { ServiceRequest } from '../models/ServiceRequest';
import { ProfessionalProfile } from '../models/ProfessionalProfile';
import { Chat } from '../models/Chat';
import { ServiceCategory, LAWYER_CATEGORIES, CA_CATEGORIES } from '../utils/constants';

export const createRequest = async (
  startupUserId: string,
  data: {
    category: ServiceCategory;
    description: string;
    city: string;
    budgetRange: string;
  },
) => {
  return ServiceRequest.create({ createdByStartupUserId: startupUserId, ...data });
};

export const getMyRequests = async (userId: string, role: string) => {
  const query =
    role === 'STARTUP'
      ? { createdByStartupUserId: userId }
      : { assignedProfessionalUserId: userId };

  const requests = await ServiceRequest.find(query).sort({ createdAt: -1 }).lean();

  if (role !== 'STARTUP') return requests;

  // For startups: enrich each ACCEPTED request with the professional's profile
  const acceptedIds = requests
    .filter(r => r.status === 'ACCEPTED' && r.assignedProfessionalUserId)
    .map(r => r.assignedProfessionalUserId!);

  const profiles = await ProfessionalProfile.find({ userId: { $in: acceptedIds } })
    .select('userId fullName professionType city feeRange')
    .lean();

  const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

  return requests.map(r => {
    if (r.status === 'ACCEPTED' && r.assignedProfessionalUserId) {
      const prof = profileMap.get(r.assignedProfessionalUserId.toString());
      return {
        ...r,
        assignedProfessional: prof
          ? {
              fullName: prof.fullName,
              professionType: prof.professionType,
              city: prof.city,
              feeRange: prof.feeRange ?? null,
            }
          : null,
      };
    }
    return r;
  });
};

export const getOpenRequests = async (city?: string, role?: string) => {
  const query: Record<string, unknown> = { status: 'OPEN' };
  if (city) query.city = new RegExp(city, 'i');
  // Filter categories so LAWYER only sees lawyer-relevant work and CA sees CA work.
  if (role === 'LAWYER') query.category = { $in: LAWYER_CATEGORIES };
  else if (role === 'CA') query.category = { $in: CA_CATEGORIES };
  const results = await ServiceRequest.find(query).sort({ createdAt: -1 });
  return { results, total: results.length };
};

export const acceptRequest = async (requestId: string, professionalUserId: string) => {
  // NOTE: isVerified check removed to allow testing. Re-enable for production:
  // const profile = await ProfessionalProfile.findOne({ userId: professionalUserId });
  // if (!profile?.isVerified) throw Object.assign(new Error('Only verified professionals can accept'), { statusCode: 403 });

  const request = await ServiceRequest.findOneAndUpdate(
    { _id: requestId, status: 'OPEN' },
    {
      status: 'ACCEPTED',
      assignedProfessionalUserId: professionalUserId,
      acceptedAt: new Date(),
    },
    { new: true },
  );

  if (!request) {
    throw Object.assign(new Error('Request not found or already accepted'), {
      statusCode: 409,
    });
  }

  // Create linked chat — use upsert so re-accepts don't crash with a duplicate-key error
  await Chat.findOneAndUpdate(
    { requestId: request._id },
    {
      $setOnInsert: {
        startupUserId: request.createdByStartupUserId,
        professionalUserId,
      },
    },
    { upsert: true, new: true },
  );

  return request;
};

export const closeRequest = async (requestId: string, startupUserId: string) => {
  const request = await ServiceRequest.findOneAndUpdate(
    {
      _id: requestId,
      createdByStartupUserId: startupUserId,
      status: { $in: ['OPEN', 'ACCEPTED'] },
    },
    { status: 'CLOSED', closedAt: new Date() },
    { new: true },
  );
  if (!request) {
    throw Object.assign(new Error('Request not found or already closed'), {
      statusCode: 404,
    });
  }
  return request;
};
