import { apiClient } from './client';
import { ApiResponse, VerificationRequest, VerifyStatus } from '@types/index';

export const adminApi = {
  listVerifications: (status?: VerifyStatus) =>
    apiClient.get<ApiResponse<VerificationRequest[]>>('/admin/verifications', {
      params: status ? { status } : undefined,
    }),

  approve: (id: string) =>
    apiClient.post<ApiResponse<VerificationRequest>>(`/admin/verifications/${id}/approve`),

  reject: (id: string, adminNote: string) =>
    apiClient.post<ApiResponse<VerificationRequest>>(`/admin/verifications/${id}/reject`, {
      adminNote,
    }),
};
