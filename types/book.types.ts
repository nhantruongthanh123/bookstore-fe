import { CategoryResponse } from './category.types';
import { AuthorResponse } from './author.types';

export interface BookResponse {
  id: number;
  title: string;
  authors: AuthorResponse[];
  publisher: string | null;
  price: number;
  isbn: string | null;
  description: string | null;
  coverImage: string | null;
  quantity: number;
  isDeleted: boolean;
  categories: CategoryResponse[];
}

export interface BookRequest {
  title: string;
  authorsIds: number[];
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
