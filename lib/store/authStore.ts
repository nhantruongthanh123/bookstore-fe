import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponse } from '@/types';
import Cookies from 'js-cookie';
import { clearTokens } from '@/lib/utils/token';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;

  setAuth: (user: UserResponse) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isInitialized: false,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.roles.includes('ROLE_ADMIN'),
          isInitialized: true,
        }),

      clearAuth: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
      },

      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: 'auth-storage',
      // isInitialized must NOT be persisted — it should always restart as false
      // so AuthProvider re-runs the session check on every fresh page load.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
