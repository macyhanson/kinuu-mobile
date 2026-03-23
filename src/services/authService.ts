import { api } from './api';
import type { User, UserRole } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  organizationName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  signUp: (data: SignUpRequest) =>
    api.post<AuthResponse>('/auth/signup', data),

  refreshToken: (token: string) =>
    api.post<AuthResponse>('/auth/refresh', {}, token),

  resetPassword: (email: string) =>
    api.post<{ message: string }>('/auth/reset-password', { email }),
};
