import apiClient from '../client';
import { OrderResponse, OrderRequest, OrderStatus, PageResponse } from '@/types';

export const orderService = {
  createOrder: async (data: OrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  getMyOrders: async (): Promise<OrderResponse[]> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getOrderById: async (id: number): Promise<OrderResponse> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id: number): Promise<OrderResponse> => {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin endpoints
  getAllOrders: async (page = 0, size = 10): Promise<PageResponse<OrderResponse>> => {
    const response = await apiClient.get('/orders/admin', { params: { page, size } });
    return response.data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<OrderResponse> => {
    const response = await apiClient.patch(`/orders/admin/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};
