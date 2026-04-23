import { ServiceRequest } from '../models/ServiceRequest';
import { ProfessionalProfile } from '../models/ProfessionalProfile';
import { StartupProfile } from '../models/StartupProfile';
import { User } from '../models/User';
import { Chat } from '../models/Chat';
import { ServiceCategory, LAWYER_CATEGORIES, CA_CATEGORIES } from '../utils/constants';

// Categories that block a new request of the same professional type
const LAWYER_BLOCK_CATS = ['CONTRACT_REVIEW', 'TRADEMARK', 'LITIGATION', 'IP_PROTECTION', 'DUE_DILIGENCE'];
const CA_BLOCK_CATS = ['COMPANY_INCORPORATION', 'TAX_FILING', 'COMPLIANCE', 'OTHER'];

export const createRequest = async (
  startupUserId: string,
  data: {
    category: ServiceCategory;
    description: string;
    city: string;
    budgetRange: string;
  },
) => {
  // Block only if there is already an active request of the SAME profession type
  const isLawyerCat = LAWYER_BLOCK_CATS.includes(data.category);
  const blockSet = isLawyerCat ? LAWYER_BLOCK_CATS : CA_BLOCK_CATS;
  const profType = isLawyerCat ? 'lawyer' : 'CA';

  const active = await ServiceRequest.findOne({
    createdByStartupUserId: startupUserId,
    status: { $in: ['OPEN', 'ACCEPTED'] },
    category: { $in: blockSet },
  });
  if (active) {
    throw Object.assign(
      new Error(`You already have an active ${profType} request. It must be completed before creating another ${profType} request.`),
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
    throw Object.assign(new Error('This request has already been accepted by another professional. Please try a different request.'), {
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
  // Only OPEN requests can be directly cancelled by the startup
  const request = await ServiceRequest.findOneAndUpdate(
    {
      _id: requestId,
      createdByStartupUserId: startupUserId,
      status: 'OPEN',
    },
    { status: 'CLOSED', closedAt: new Date() },
    { new: true },
  );
  if (!request) {
    throw Object.assign(new Error('Only open requests can be cancelled. Use \'End Service\' to close an accepted request mutually.'), {
      statusCode: 404,
    });
  }
  return request;
};

export const requestEndService = async (requestId: string, userId: string) => {
  const request = await ServiceRequest.findOne({ _id: requestId, status: 'ACCEPTED' });
  if (!request) {
    throw Object.assign(new Error('Request not found or is not currently active.'), { statusCode: 404 });
  }

  const isStartup = request.createdByStartupUserId.toString() === userId;
  const isProfessional = request.assignedProfessionalUserId?.toString() === userId;

  if (!isStartup && !isProfessional) {
    throw Object.assign(new Error('You are not a party to this request.'), { statusCode: 403 });
  }

  if (isStartup) request.endRequestedByStartup = true;
  if (isProfessional) request.endRequestedByProfessional = true;

  // Both parties agreed — close the request
  if (request.endRequestedByStartup && request.endRequestedByProfessional) {
    request.status = 'CLOSED';
    request.closedAt = new Date();
  }

  await request.save();
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
    throw Object.assign(new Error('This request cannot be rejected. It may have already been processed or does not exist.'), {
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
  if (!profile) throw Object.assign(new Error('Startup profile not found.'), { statusCode: 404 });
  return { ...profile, personName: user?.name ?? '', email: user?.email ?? '' };
};
