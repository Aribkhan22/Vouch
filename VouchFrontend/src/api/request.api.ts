import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, ServiceRequest, ServiceCategory } from '@types/index';

export interface CreateRequestPayload {
  category: ServiceCategory;
  description: string;
  city: string;
  budgetRange: string;
}

export interface OpenRequestsFilters {
  city?: string;
  category?: ServiceCategory;
  page?: number;
  limit?: number;
}

export const requestApi = {
  create: (payload: CreateRequestPayload) =>
    apiClient.post<ApiResponse<ServiceRequest>>('/requests', payload),

  mine: () => apiClient.get<ApiResponse<ServiceRequest[]>>('/requests/mine'),

  open: (filters: OpenRequestsFilters = {}) =>
    apiClient.get<ApiResponse<PaginatedResponse<ServiceRequest>>>('/requests/open', {
      params: filters,
    }),

  accept: (requestId: string) =>
    apiClient.post<ApiResponse<ServiceRequest>>(`/requests/${requestId}/accept`),

  reject: (requestId: string, reason: string) =>
    apiClient.post<ApiResponse<ServiceRequest>>(`/requests/${requestId}/reject`, { reason }),

  close: (requestId: string) =>
    apiClient.post<ApiResponse<ServiceRequest>>(`/requests/${requestId}/close`),

  getStartupProfile: (startupUserId: string) =>
    apiClient.get<ApiResponse<any>>(`/requests/startup/${startupUserId}/profile`),
};
