import apiClient from '../client';
import { BookResponse, BookRequest, SearchBookRequest, PageResponse } from '@/types';

export const bookService = {
  getAllBooks: async (page = 0, size = 5): Promise<PageResponse<BookResponse>> => {
    const response = await apiClient.get('/books', { params: { page, size } });
    return response.data;
  },

  searchBooks: async (
    searchParams: SearchBookRequest,
    page = 0,
    size = 20
  ): Promise<PageResponse<BookResponse>> => {
    const response = await apiClient.get('/books/search', {
      params: { ...searchParams, page, size },
    });
    return response.data;
  },

  getBookById: async (id: number): Promise<BookResponse> => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },

  createBook: async (data: BookRequest): Promise<BookResponse> => {
    const response = await apiClient.post('/books', data);
    return response.data;
  },

  updateBook: async (id: number, data: BookRequest): Promise<BookResponse> => {
    const response = await apiClient.put(`/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (id: number): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  },
};
