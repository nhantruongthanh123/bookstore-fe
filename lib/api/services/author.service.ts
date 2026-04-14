import apiClient from '../client';
import { PageResponse } from '../../../types/common.types';
import { AuthorResponse, AuthorRequest } from '../../../types/author.types';

export const authorService = {
  getAuthors: async (
    page: number = 0,
    size: number = 20,
    sort: string = 'name',
    find?: string
  ): Promise<PageResponse<AuthorResponse>> => {
    const params: Record<string, any> = { page, size, sort };
    if (find) params.find = find;
    const { data } = await apiClient.get('/authors', { params });
    return data;
  },

  getAuthorById: async (id: number): Promise<AuthorResponse> => {
    const { data } = await apiClient.get(`/authors/${id}`);
    return data;
  },

  createAuthor: async (author: AuthorRequest): Promise<AuthorResponse> => {
    const { data } = await apiClient.post('/admin/authors', author);
    return data;
  },

  updateAuthor: async (id: number, author: AuthorRequest): Promise<AuthorResponse> => {
    const { data } = await apiClient.patch(`/admin/authors/${id}`, author);
    return data;
  },

  deleteAuthor: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/authors/${id}`);
  },
};
