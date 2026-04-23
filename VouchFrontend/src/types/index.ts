// Shared TypeScript interfaces used across the app

export type Role = 'STARTUP' | 'LAWYER' | 'CA' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type VerifyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RequestStatus = 'OPEN' | 'ACCEPTED' | 'CLOSED' | 'REJECTED';
export type ProfessionType = 'LAWYER' | 'CA';

export type ServiceCategory =
  | 'CONTRACT_REVIEW'
  | 'COMPANY_INCORPORATION'
  | 'TRADEMARK'
  | 'TAX_FILING'
  | 'COMPLIANCE'
  | 'LITIGATION'
  | 'IP_PROTECTION'
  | 'DUE_DILIGENCE'
  | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface StartupProfile {
  _id: string;
  userId: string;
  companyName: string;
  industry: string;
  city: string;
  description: string;
  createdAt: string;
}

export interface ProfessionalProfile {
  _id: string;
  userId: string;
  fullName: string;
  professionType: ProfessionType;
  city: string;
  experienceYears: number;
  specializations: string[];
  licenseNumber: string;
  feeRange?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface VerificationRequest {
  _id: string;
  professionalUserId: string | { _id: string; name: string; email: string };
  docUrls: string[];
  status: VerifyStatus;
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface AssignedProfessional {
  fullName: string;
  professionType: 'LAWYER' | 'CA';
  city: string;
  feeRange: string | null;
}

export interface ServiceRequest {
  _id: string;
  createdByStartupUserId: string;
  category: ServiceCategory;
  description: string;
  city: string;
  budgetRange: string;
  status: RequestStatus;
  assignedProfessionalUserId?: string;
  assignedProfessional?: AssignedProfessional | null;
  /** Populated for professional's own requests */
  startupCompanyName?: string;
  startupPersonName?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  acceptedAt?: string;
  closedAt?: string;
  endRequestedByStartup: boolean;
  endRequestedByProfessional: boolean;
}

export interface Chat {
  _id: string;
  requestId: string;
  startupUserId: string;
  professionalUserId: string;
  createdAt: string;
}

// Enriched chat returned by GET /chats/:chatId
export interface ChatWithParticipants extends Chat {
  startupName: string;
  startupPersonName: string;
  professionalName: string;
  professionalType: 'LAWYER' | 'CA' | 'PROFESSIONAL';
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
}
