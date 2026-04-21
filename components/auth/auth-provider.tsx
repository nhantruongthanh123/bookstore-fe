'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { userService } from '@/lib/api/services/user.service';
import { authService } from '@/lib/api/services/auth.service';
import { getAccessToken } from '@/lib/utils/token';
import { Loader2 } from 'lucide-react';

/**
 * AuthProvider — session bootstrap on first mount.
 * 
 * Reverted to Cookie-Based access token storage.
 * On mount, it checks for an existing accessToken cookie. 
 * If missing, it attempts a Silent Refresh via the HttpOnly refreshToken cookie.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setAuth, clearAuth, setInitialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Already initialized in this session — skip
    if (isInitialized) {
      setIsLoading(false);
      return;
    }

    const restoreSession = async () => {
      const token = getAccessToken();

      try {
        if (token) {
          // Token exists, just refresh the profile data to ensure it's still valid
          const profile = await userService.getProfile();
          setAuth(profile);
        } else {
          // No access token — attempt silent refresh
          await authService.refreshToken();
          const profile = await userService.getProfile();
          setAuth(profile);
        }
      } catch (error) {
        // Both token check and refresh failed
        clearAuth();
      } finally {
        setIsLoading(false);
        setInitialized();
      }
    };

    restoreSession();
  }, [isInitialized, setAuth, clearAuth, setInitialized]);

  // Only show loading screen on the very first initialization
  if (isLoading && !isInitialized) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FCFBFA] z-[9999]">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-[#F06A42] animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-[#F06A42]/10"></div>
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold animate-pulse">
          Initializing Session
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
