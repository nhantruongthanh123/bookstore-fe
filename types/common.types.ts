export interface PageResponse<T> {
  content: T[];
  pageNo?: number;
  pageSize?: number;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset?: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first?: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
