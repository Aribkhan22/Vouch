import { VerificationRequest } from '../models/VerificationRequest';
import { ProfessionalProfile } from '../models/ProfessionalProfile';

export const submitVerification = async (userId: string, docUrls: string[]) => {
  const existing = await VerificationRequest.findOne({
    professionalUserId: userId,
    status: 'PENDING',
  });
  if (existing) {
    throw Object.assign(new Error('A pending verification already exists'), {
      statusCode: 409,
    });
  }
  return VerificationRequest.create({ professionalUserId: userId, docUrls });
};

export const listVerifications = async (status?: string) => {
  const query: Record<string, string> = {};
  if (status) query.status = status;
  return VerificationRequest.find(query)
    .populate('professionalUserId', 'name email')
    .sort({ submittedAt: -1 });
};

export const approveVerification = async (id: string, adminId: string) => {
  const req = await VerificationRequest.findById(id);
  if (!req) throw Object.assign(new Error('Verification not found'), { statusCode: 404 });
  if (req.status !== 'PENDING') {
    throw Object.assign(new Error('Already reviewed'), { statusCode: 409 });
  }
  req.status = 'APPROVED';
  req.reviewedBy = adminId as unknown as import('mongoose').Types.ObjectId;
  req.reviewedAt = new Date();
  await req.save();

  await ProfessionalProfile.findOneAndUpdate(
    { userId: req.professionalUserId },
    { isVerified: true },
  );
  return req;
};

export const rejectVerification = async (
  id: string,
  adminId: string,
  adminNote: string,
) => {
  const req = await VerificationRequest.findById(id);
  if (!req) throw Object.assign(new Error('Verification not found'), { statusCode: 404 });
  if (req.status !== 'PENDING') {
    throw Object.assign(new Error('Already reviewed'), { statusCode: 409 });
  }
  req.status = 'REJECTED';
  req.reviewedBy = adminId as unknown as import('mongoose').Types.ObjectId;
  req.reviewedAt = new Date();
  req.adminNote = adminNote;
  await req.save();
  return req;
};
