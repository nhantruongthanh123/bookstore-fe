import apiClient from '../client';
import { CartResponse, AddToCartRequest, UpdateCartItemRequest } from '@/types';

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await apiClient.post('/cart/add', data);
    return response.data;
  },

  updateCartItem: async (
    itemId: number,
    data: UpdateCartItemRequest
  ): Promise<CartResponse> => {
    const response = await apiClient.put(`/cart/items/${itemId}`, data);
    return response.data;
  },

  removeCartItem: async (itemId: number): Promise<CartResponse> => {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart/items');
  },
};
