import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponse } from '@/types';
import { clearAccessToken } from '@/lib/utils/token';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;

  setAuth: (user: UserResponse) => void;
  clearAuth: () => Promise<void>;
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

      clearAuth: async () => {
        // Dynamic import to avoid circular dependency
        try {
          const { authService } = await import('@/lib/api/services/auth.service');
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          clearAccessToken();
          set({ user: null, isAuthenticated: false, isAdmin: false, isInitialized: true });
        }
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
