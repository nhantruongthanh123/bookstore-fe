export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  expiresIn: number;
  id: number;
  username: string;
  email: string;
  roles: string[];
  fullName?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  roles: string[];
  enabled: boolean;
  accountNonLocked: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
