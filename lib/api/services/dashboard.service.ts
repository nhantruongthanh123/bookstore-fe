import apiClient from '../client';
import { DashboardResponse } from '@/types';

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
};
