'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { authService } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Cookies from 'js-cookie';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(8, 'Password must be at least  characters'),
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

      const {
        accessToken,
        refreshToken,
        type,
        expiresIn,
        ...userProfile
      } = response;

      Cookies.set('accessToken', accessToken);
      Cookies.set('refreshToken', refreshToken);

      setAuth(userProfile);

      router.push('/');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message || 'Login failed'
          : 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FCFBFA] relative overflow-hidden font-sans">
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      ></div>

      <div className="relative w-full max-w-[440px] p-8 sm:p-12 space-y-8 bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-[#EAE8E3]/50">
        <div className="text-center space-y-1.5">
          <h1 className="text-[32px] md:text-[36px] font-serif text-[#161B22] tracking-tight leading-tight">Welcome Back</h1>
          <p className="text-[13px] text-gray-500 font-medium">Login to your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail" className="text-[10px] font-bold uppercase tracking-widest text-[#F06A42]">
              Username or Email
            </Label>
            <Input
              id="usernameOrEmail"
              {...register('usernameOrEmail')}
              placeholder="e.g. curator_reader"
              className="h-12 bg-[#EAE8E3]/60 border-transparent focus-visible:ring-1 focus-visible:ring-[#F06A42] focus-visible:ring-offset-0 placeholder:text-gray-400 rounded-lg text-[15px] text-gray-800 font-medium transition-all"
            />
            {errors.usernameOrEmail && (
              <p className="text-xs text-red-600">{errors.usernameOrEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-[#F06A42]">
                Password
              </Label>
              <Link href="#" className="text-[10px] font-bold text-[#161B22] hover:text-[#F06A42] transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="h-12 bg-[#EAE8E3]/60 border-transparent focus-visible:ring-1 focus-visible:ring-[#F06A42] focus-visible:ring-offset-0 placeholder:text-gray-400 rounded-lg text-lg tracking-[0.2em] font-medium text-gray-800 transition-all font-mono"
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full h-12 bg-[#0A192F] hover:bg-[#162A4B] text-white rounded-lg text-[15px] font-medium transition-all shadow-md active:scale-[0.98]" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>

        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold">
            <span className="bg-white px-4 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg text-[14px] font-medium shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all active:scale-[0.98]"
          onClick={() => authService.googleLogin()}
        >
          <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </Button>

        <div className="text-center pt-2">
          <p className="text-[13px] text-gray-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#F06A42] hover:text-[#E05931] hover:underline font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
