import { CategoryResponse } from './category.types';

export interface BookResponse {
  id: number;
  title: string;
  author: string;
  publisher: string | null;
  price: number;
  isbn: string | null;
  description: string | null;
  coverImage: string | null;
  quantity: number;
  categories: CategoryResponse[];
}

export interface BookRequest {
  title: string;
  author: string;
  publisher?: string;
  price: number;
  isbn?: string;
  description?: string;
  coverImage?: string;
  quantity: number;
  categoryIds: number[];
}

export interface SearchBookRequest {
  title?: string;
  author?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
