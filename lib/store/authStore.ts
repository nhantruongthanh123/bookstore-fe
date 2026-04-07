import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponse } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  setAuth: (user: UserResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (user) =>
        set({
          user: user,
          isAuthenticated: true,
          isAdmin: user.roles.includes('ROLE_ADMIN')
        }),

      clearAuth: () => {
        set({ user: null, isAuthenticated: false, isAdmin: false });

        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
