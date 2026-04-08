import apiClient from '../client';
import { UserResponse } from '@/types/auth.types';

export interface UpdateUserProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  avatar?: string;
}

export const userService = {
  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateUserProfileRequest): Promise<UserResponse> => {
    // Clean up empty strings to avoid passing them to backend
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '')
    );
    
    // If backend requires LocalDateTime format for birth date, you can append 'T00:00:00' here if needed.
    // Assuming backend accepts what was parsed.
    const response = await apiClient.patch('/users/me', payload);
    return response.data;
  },
};
