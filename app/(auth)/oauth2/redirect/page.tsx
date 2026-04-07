'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';

function OAuth2RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleRedirect = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth2 login failed:', error);
        router.push('/login?error=OAuth2 login failed');
        return;
      }

      if (accessToken && refreshToken) {
        try {
          // Temporarily set tokens so we can fetch the user profile
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Assuming there's a /users/me or /auth/me endpoint to get the user context!
          // You might need to update this endpoint to match your actual backend API
          const response = await apiClient.get('/auth/me'); 
          
          setAuth(response.data, accessToken, refreshToken);
          router.push('/');
        } catch (err) {
          console.error('Failed to fetch user profile after OAuth2 login:', err);
          router.push('/login?error=Failed to retrieve user profile');
        }
      } else {
        router.push('/login');
      }
    };

    handleRedirect();
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-xl">Completing login...</p>
      </div>
    </div>
  );
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
      </div>
    }>
      <OAuth2RedirectHandler />
    </Suspense>
  );
}
