import { apiClient } from './client';
import { ApiResponse, StartupProfile } from '@types/index';

export interface StartupProfilePayload {
  companyName: string;
  industry: string;
  city: string;
  description: string;
}

export const startupApi = {
  upsertProfile: (payload: StartupProfilePayload) =>
    apiClient.put<ApiResponse<StartupProfile>>('/startup/profile', payload),

  getProfile: (userId: string) =>
    apiClient.get<ApiResponse<StartupProfile>>(`/startup/profile/${userId}`),
};
