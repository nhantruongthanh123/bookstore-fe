import apiClient from '../client';
import { LoginRequest, RegisterRequest, AuthResponse, TokenRefreshResponse } from '@/types';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  googleLogin: () => {
    window.location.href = 'https://book-shop.duckdns.org/oauth2/authorization/google';
  },
};
