'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/lib/store/authStore';
import { userService } from '@/lib/api/services/user.service';

/**
 * AuthProvider — session bootstrap on first mount.
 *
 * Runs once per app lifecycle (isInitialized gates re-entry).
 * Responsibilities:
 *  1. No accessToken cookie → mark as initialized (guest).
 *  2. Token exists but Zustand `user` is null → call GET /users/me to restore.
 *  3. Token expired → axios interceptor refreshes automatically.
 *     If refresh also fails, interceptor calls clearAuth() + redirects to /login.
 *  4. User already in store → setInitialized() immediately, no API call needed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, clearAuth, setInitialized } = useAuthStore();

  useEffect(() => {
    // Already initialized in this session — skip
    if (isInitialized) return;

    const restoreSession = async () => {
      const accessToken = Cookies.get('accessToken');

      // No token at all → confirmed guest
      if (!accessToken) {
        setInitialized();
        return;
      }

      // Token exists but user missing from store → restore from API
      if (!user) {
        try {
          const profile = await userService.getProfile();
          setAuth(profile); // also sets isInitialized: true
        } catch {
          // Token expired + refresh chain exhausted → interceptor already
          // called clearAuth(). Just ensure initialized is set.
          clearAuth();
        }
        return;
      }

      // User already in store (persisted from localStorage) → nothing to fetch
      setInitialized();
    };

    restoreSession();
  }, [isInitialized]); // re-runs if isInitialized resets (e.g. clearAuth)

  return <>{children}</>;
}
