# 🚀 Frontend Quick-Start Guide - Bookstore Next.js Integration

## 📌 Overview

This guide provides step-by-step instructions to build and integrate the Next.js frontend with your Spring Boot backend.

**Backend API:** `http://localhost:8080/api`  
**Frontend App:** `http://localhost:3000`

---

## 🏁 Step 1: Create Next.js Project

```bash
# Create new Next.js project with TypeScript and Tailwind
npx create-next-app@latest bookstore-frontend
```

**Configuration prompts:**
- ✅ Would you like to use TypeScript? **Yes**
- ✅ Would you like to use ESLint? **Yes**
- ✅ Would you like to use Tailwind CSS? **Yes**
- ✅ Would you like to use `src/` directory? **No**
- ✅ Would you like to use App Router? **Yes**
- ✅ Would you like to customize the default import alias? **No**

```bash
cd bookstore-frontend
```

---

## 📦 Step 2: Install Required Dependencies

```bash
# Core dependencies
npm install axios zustand

# Form handling and validation
npm install react-hook-form @hookform/resolvers zod

# UI components (shadcn/ui)
npx shadcn@latest init

# Add specific shadcn components
npx shadcn@latest add button input card dialog select table dropdown-menu
npx shadcn@latest add label textarea checkbox avatar badge separator

# Additional utilities
npm install clsx tailwind-merge lucide-react date-fns
```

---

## 📁 Step 3: Create Project Structure

```bash
# Create directory structure
mkdir -p lib/api/services
mkdir -p lib/hooks
mkdir -p lib/store
mkdir -p lib/utils
mkdir -p lib/schemas
mkdir -p types
mkdir -p components/ui
mkdir -p components/auth
mkdir -p components/books
mkdir -p components/cart
mkdir -p components/orders
mkdir -p components/common
mkdir -p components/layout
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/register
mkdir -p app/\(auth\)/oauth2/redirect
mkdir -p app/\(main\)/books/\[id\]
mkdir -p app/\(main\)/cart
mkdir -p app/\(main\)/orders/\[id\]
mkdir -p app/\(admin\)/dashboard
mkdir -p app/\(admin\)/books/create
mkdir -p app/\(admin\)/books/\[id\]/edit
```

---

## ⚙️ Step 4: Configure Environment Variables

Create `.env.local` in the root directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Google OAuth2 (get from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Bookstore
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔧 Step 5: Setup API Client with Token Management

### 5.1 Token Utilities

Create `lib/utils/token.ts`:

```typescript
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
```

### 5.2 Axios Client with Interceptors

Create `lib/api/client.ts`:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/utils/token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add access token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        
        setTokens(newAccessToken, newRefreshToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 📘 Step 6: Create TypeScript Types

### 6.1 Common Types

Create `types/common.types.ts`:

```typescript
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
```

### 6.2 Auth Types

Create `types/auth.types.ts`:

```typescript
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  roles: string[];
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
```

### 6.3 Book Types

Create `types/book.types.ts`:

```typescript
import { CategoryResponse } from './category.types';

export interface BookResponse {
  id: number;
  title: string;
  author: string;
  publisher: string;
  price: number;
  isbn: string;
  description: string;
  coverImage: string;
  quantity: number;
  categories: CategoryResponse[];
}

export interface BookRequest {
  title: string;
  author: string;
  publisher: string;
  price: number;
  isbn: string;
  description: string;
  coverImage: string;
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
```

### 6.4 Cart & Order Types

Create `types/cart.types.ts`:

```typescript
export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalPrice: number;
  totalItems: number;
}

export interface CartItemResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookPrice: number;
  bookCoverImage: string;
  quantity: number;
  subtotal: number;
}

export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
```

Create `types/order.types.ts`:

```typescript
export interface OrderResponse {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  phoneNumber: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderRequest {
  shippingAddress: string;
  phoneNumber: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
```

Create `types/category.types.ts`:

```typescript
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}
```

Create `types/index.ts` to export all types:

```typescript
export * from './common.types';
export * from './auth.types';
export * from './book.types';
export * from './cart.types';
export * from './order.types';
export * from './category.types';
```

---

## 🎯 Step 7: Create API Services

### 7.1 Authentication Service

Create `lib/api/services/auth.service.ts`:

```typescript
import apiClient from '../client';
import { LoginRequest, RegisterRequest, AuthResponse, TokenRefreshResponse } from '@/types';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  googleLogin: () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  },
};
```

### 7.2 Book Service

Create `lib/api/services/book.service.ts`:

```typescript
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
```

### 7.3 Cart Service

Create `lib/api/services/cart.service.ts`:

```typescript
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

  removeCartItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/cart/items/${itemId}`);
  },
};
```

### 7.4 Order Service

Create `lib/api/services/order.service.ts`:

```typescript
import apiClient from '../client';
import { OrderResponse, OrderRequest, PageResponse } from '@/types';

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

  updateOrderStatus: async (id: number, status: string): Promise<OrderResponse> => {
    const response = await apiClient.patch(`/orders/admin/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};
```

### 7.5 Category Service

Create `lib/api/services/category.service.ts`:

```typescript
import apiClient from '../client';
import { CategoryResponse, CategoryRequest } from '@/types';

export const categoryService = {
  getAllCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
```

### 7.6 File Upload Service

Create `lib/api/services/file.service.ts`:

```typescript
import apiClient from '../client';

export const fileService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },
};
```

---

## 🗄️ Step 8: Setup State Management with Zustand

### 8.1 Auth Store

Create `lib/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponse } from '@/types';
import { setTokens as saveTokens, clearTokens as removeTokens } from '@/lib/utils/token';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  setAuth: (user: UserResponse, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (user, accessToken, refreshToken) => {
        saveTokens(accessToken, refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.roles.includes('ROLE_ADMIN'),
        });
      },

      clearAuth: () => {
        removeTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      updateTokens: (accessToken, refreshToken) => {
        saveTokens(accessToken, refreshToken);
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 8.2 Cart Store

Create `lib/store/cartStore.ts`:

```typescript
import { create } from 'zustand';
import { cartService } from '@/lib/api/services/cart.service';
import { CartResponse, AddToCartRequest } from '@/types';

interface CartState {
  cart: CartResponse | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addToCart: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.addToCart(data);
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.updateCartItem(itemId, { quantity });
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.removeCartItem(itemId);
      await get().fetchCart();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearCart: () => {
    set({ cart: null });
  },
}));
```

---

## 🎨 Step 9: Create Example Pages

### 9.1 Login Page

Create `app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken, response.refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail">Username or Email</Label>
            <Input
              id="usernameOrEmail"
              {...register('usernameOrEmail')}
              placeholder="Enter your username or email"
            />
            {errors.usernameOrEmail && (
              <p className="text-sm text-red-600">{errors.usernameOrEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => authService.googleLogin()}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 9.2 Books Listing Page

Create `app/(main)/books/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { bookService } from '@/lib/api/services/book.service';
import { BookResponse, PageResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function BooksPage() {
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response: PageResponse<BookResponse> = await bookService.getAllBooks(page, 12);
      setBooks(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }

    setLoading(true);
    try {
      const response = await bookService.searchBooks({ title: searchQuery }, 0, 12);
      setBooks(response.content);
      setTotalPages(response.totalPages);
      setPage(0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Books</h1>

      {/* Search */}
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search books by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={book.coverImage || '/placeholder-book.jpg'}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{book.title}</CardTitle>
              <CardDescription>{book.author}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${book.price}</p>
              <p className="text-sm text-gray-600 mt-2">
                Stock: {book.quantity > 0 ? book.quantity : 'Out of stock'}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/books/${book.id}`} className="w-full">
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 9.3 Shopping Cart Page

Create `app/(main)/cart/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, fetchCart, updateQuantity, removeItem, isLoading } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, fetchCart, router]);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <Button onClick={() => router.push('/books')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-20 flex-shrink-0">
                    <Image
                      src={item.bookCoverImage || '/placeholder-book.jpg'}
                      alt={item.bookTitle}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.bookTitle}</h3>
                    <p className="text-gray-600">${item.bookPrice}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Items ({cart.totalItems}):</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔒 Step 10: Add Middleware for Protected Routes

Create `middleware.ts` in the root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get auth state from cookie or header
  const authCookie = request.cookies.get('auth-storage');
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');
  
  const isProtectedPage = request.nextUrl.pathname.startsWith('/cart') ||
                          request.nextUrl.pathname.startsWith('/orders') ||
                          request.nextUrl.pathname.startsWith('/profile');
  
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && authCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login
  if ((isProtectedPage || isAdminPage) && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/cart/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
```

---

## 🚀 Step 11: Run the Application

```bash
# Start the backend (Spring Boot)
cd bookstore
./mvnw spring-boot:run

# Start the frontend (Next.js) - in a new terminal
cd bookstore-frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html

---

## 📊 Integration Flow Summary

```
┌─────────────┐
│   User      │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  React Component    │
│  (Login, Books,     │
│   Cart, etc.)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  API Service        │
│  (authService,      │
│   bookService, etc.)│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Axios Client       │
│  with Interceptors  │
└──────┬──────────────┘
       │ HTTP Request + JWT Token
       ▼
┌────────────────────────────┐
│  Spring Boot Backend API   │
│  (Port 8080)               │
│  • JWT Validation          │
│  • Business Logic          │
│  • Database Operations     │
└──────┬─────────────────────┘
       │ JSON Response
       ▼
┌─────────────────────┐
│  Axios Interceptor  │
│  (Handle 401,       │
│   Refresh Token)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Zustand Store      │
│  (Update State)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  UI Update          │
│  (Re-render)        │
└─────────────────────┘
```

---

## ✅ Testing the Integration

### 1. Test Authentication
```bash
# Open browser to http://localhost:3000/login
# Try logging in with credentials
# Check localStorage for tokens
# Verify redirect to homepage
```

### 2. Test Book Listing
```bash
# Navigate to http://localhost:3000/books
# Verify books are displayed
# Test pagination
# Test search functionality
```

### 3. Test Cart Operations
```bash
# Login first
# Add items to cart
# Update quantities
# Remove items
# Verify cart total updates
```

### 4. Test Token Refresh
```bash
# Open DevTools > Network tab
# Wait 15 minutes (or modify token expiration for testing)
# Make any API call
# Verify refresh token endpoint is called
# Verify new access token is received
```

---

## 🎯 Next Steps

1. **Add more pages:** Categories, Orders, Profile, Admin Dashboard
2. **Improve UI:** Add loading states, error boundaries, toast notifications
3. **Add form validation:** Use Zod schemas for all forms
4. **Implement search filters:** Price range, categories, sorting
5. **Add image upload:** Integrate with Cloudinary for book cover uploads
6. **Setup CI/CD:** Deploy to Vercel or similar platform
7. **Add tests:** Unit tests with Jest, E2E tests with Playwright

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Axios Documentation](https://axios-http.com)

---

**Happy coding! 🎉**
