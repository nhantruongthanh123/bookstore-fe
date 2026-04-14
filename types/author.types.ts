export interface AuthorResponse {
  id: number;
  name: string;
  description: string | null;
}

export interface AuthorRequest {
  name: string;
  description?: string;
}
