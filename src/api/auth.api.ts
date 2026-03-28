import { apiClient } from './client';
import { ApiResponse, User } from '@types/index';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'STARTUP' | 'LAWYER' | 'CA';
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/login', payload),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken,
    }),

  me: () => apiClient.get<ApiResponse<User>>('/auth/me'),
};
