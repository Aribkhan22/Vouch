import { ServiceRequest } from '../models/ServiceRequest';
import { ProfessionalProfile } from '../models/ProfessionalProfile';
import { Chat } from '../models/Chat';
import { ServiceCategory } from '../utils/constants';

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
  return ServiceRequest.find(query).sort({ createdAt: -1 });
};

export const getOpenRequests = async (city?: string) => {
  const query: Record<string, unknown> = { status: 'OPEN' };
  if (city) query.city = new RegExp(city, 'i');
  return ServiceRequest.find(query).sort({ createdAt: -1 });
};

export const acceptRequest = async (requestId: string, professionalUserId: string) => {
  // Verify professional is verified
  const profile = await ProfessionalProfile.findOne({ userId: professionalUserId });
  if (!profile?.isVerified) {
    throw Object.assign(new Error('Only verified professionals can accept requests'), {
      statusCode: 403,
    });
  }

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

  // Create linked chat
  await Chat.create({
    requestId: request._id,
    startupUserId: request.createdByStartupUserId,
    professionalUserId,
  });

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
