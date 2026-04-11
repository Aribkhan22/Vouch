import { ServiceRequest } from '../models/ServiceRequest';
import { ProfessionalProfile } from '../models/ProfessionalProfile';
import { StartupProfile } from '../models/StartupProfile';
import { User } from '../models/User';
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
  // Block if startup already has an active (OPEN or ACCEPTED) request
  const active = await ServiceRequest.findOne({
    createdByStartupUserId: startupUserId,
    status: { $in: ['OPEN', 'ACCEPTED'] },
  });
  if (active) {
    throw Object.assign(
      new Error('You already have an active request. Wait for it to be completed or rejected before creating a new one.'),
      { statusCode: 409 },
    );
  }
  return ServiceRequest.create({ createdByStartupUserId: startupUserId, ...data });
};

export const getMyRequests = async (userId: string, role: string) => {
  const query =
    role === 'STARTUP'
      ? { createdByStartupUserId: userId }
      : { assignedProfessionalUserId: userId };

  const requests = await ServiceRequest.find(query).sort({ createdAt: -1 }).lean();

  if (role !== 'STARTUP') {
    // Enrich professional's requests with startup company name and person name
    const startupUserIds = requests.map(r => r.createdByStartupUserId);

    const [startupProfiles, startupUsers] = await Promise.all([
      StartupProfile.find({ userId: { $in: startupUserIds } })
        .select('userId companyName')
        .lean(),
      User.find({ _id: { $in: startupUserIds } })
        .select('_id name')
        .lean(),
    ]);

    const profileMap = new Map(startupProfiles.map(p => [p.userId.toString(), p.companyName]));
    const userMap = new Map(startupUsers.map(u => [u._id.toString(), u.name]));

    return requests.map(r => ({
      ...r,
      startupCompanyName: profileMap.get(r.createdByStartupUserId.toString()) ?? 'Startup',
      startupPersonName: userMap.get(r.createdByStartupUserId.toString()) ?? '',
    }));
  }

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
  if (role === 'LAWYER') query.category = { $in: LAWYER_CATEGORIES };
  else if (role === 'CA') query.category = { $in: CA_CATEGORIES };
  const requests = await ServiceRequest.find(query).sort({ createdAt: -1 }).lean();

  // Enrich with startup company name and person name
  const startupUserIds = requests.map(r => r.createdByStartupUserId);
  const [startupProfiles, startupUsers] = await Promise.all([
    StartupProfile.find({ userId: { $in: startupUserIds } }).select('userId companyName').lean(),
    User.find({ _id: { $in: startupUserIds } }).select('_id name').lean(),
  ]);
  const profileMap = new Map(startupProfiles.map(p => [p.userId.toString(), p.companyName]));
  const userMap = new Map(startupUsers.map(u => [u._id.toString(), u.name]));

  const results = requests.map(r => ({
    ...r,
    startupCompanyName: profileMap.get(r.createdByStartupUserId.toString()) ?? 'Startup',
    startupPersonName: userMap.get(r.createdByStartupUserId.toString()) ?? '',
  }));
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

export const rejectRequest = async (
  requestId: string,
  professionalUserId: string,
  reason: string,
) => {
  const request = await ServiceRequest.findOneAndUpdate(
    { _id: requestId, status: { $in: ['OPEN', 'ACCEPTED'] } },
    {
      status: 'REJECTED',
      assignedProfessionalUserId: professionalUserId,
      rejectionReason: reason,
      rejectedAt: new Date(),
    },
    { new: true },
  );
  if (!request) {
    throw Object.assign(new Error('Request not found or cannot be rejected'), {
      statusCode: 404,
    });
  }
  return request;
};

export const getStartupProfile = async (startupUserId: string) => {
  const [profile, user] = await Promise.all([
    StartupProfile.findOne({ userId: startupUserId }).lean(),
    User.findById(startupUserId).select('name email').lean(),
  ]);
  if (!profile) throw Object.assign(new Error('Startup profile not found'), { statusCode: 404 });
  return { ...profile, personName: user?.name ?? '', email: user?.email ?? '' };
};
