import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, ProfessionalProfile } from '@types/index';

export interface ProfessionalProfilePayload {
  fullName: string;
  professionType: 'LAWYER' | 'CA';
  city: string;
  experienceYears: number;
  specializations: string[];
  licenseNumber: string;
  feeRange?: string;
}

export interface DirectoryFilters {
  city?: string;
  type?: 'LAWYER' | 'CA';
  specialization?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}

export const professionalApi = {
  upsertProfile: (payload: ProfessionalProfilePayload) =>
    apiClient.put<ApiResponse<ProfessionalProfile>>('/professional/profile', payload),

  getProfile: (userId: string) =>
    apiClient.get<ApiResponse<ProfessionalProfile>>(`/professional/profile/${userId}`),

  listDirectory: (filters: DirectoryFilters = {}) =>
    apiClient.get<ApiResponse<PaginatedResponse<ProfessionalProfile>>>('/professionals', {
      params: { ...filters, verified: filters.verified !== false ? 'true' : 'false' },
    }),

  submitVerification: (formData: FormData) =>
    apiClient.post<ApiResponse<unknown>>('/professional/verification/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
