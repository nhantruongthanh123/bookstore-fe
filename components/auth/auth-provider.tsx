'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { userService } from '@/lib/api/services/user.service';
import { authService } from '@/lib/api/services/auth.service';
import { Loader2 } from 'lucide-react';

/**
 * AuthProvider — session bootstrap on first mount.
 * 
 * In the In-Memory approach, the accessToken is lost on page refresh.
 * This provider performs a "Silent Refresh" on mount to restore the session
 * using the HttpOnly refreshToken cookie.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, setAuth, clearLocalAuth, setInitialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If already initialized in this session, we're good
    if (isInitialized) {
      setIsLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        // 1. Attempt Silent Refresh to get a new In-Memory Access Token
        await authService.refreshToken();

        // 2. Fetch User Profile using the new token
        const profile = await userService.getProfile();
        setAuth(profile);
      } catch (error) {
        // Refresh failed or user not logged in
        // Clear local state without calling backend logout
        clearLocalAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [isInitialized, setAuth, setInitialized]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FCFBFA] z-[9999]">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-[#F06A42] animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-[#F06A42]/10"></div>
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold animate-pulse">
          Restoring Session
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
