export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}
