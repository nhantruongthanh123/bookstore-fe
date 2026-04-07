'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { authService } from '@/lib/api/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string()
    .min(10, 'Please enter a valid phone number')
    .regex(/^\+?[0-9\s\-\(\)]+$/, 'Invalid phone number format'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      await authService.register(data);
      router.push('/login?registered=true');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message || 'Registration failed'
          : 'Registration failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FCFBFA] relative overflow-hidden font-sans p-4 py-12">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      ></div>

      {/* Header section outside card */}
      <div className="relative z-10 text-center mb-8 space-y-2 mt-4 md:mt-0">
        <h1 className="text-[40px] md:text-[44px] font-serif italic text-[#161B22] tracking-tight leading-tight">
          Create your Account
        </h1>
        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
          Join our literary community
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[640px] p-8 sm:p-11 bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-[#EAE8E3]/50">

        {error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-md text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-[#5a6270]">
                Full Name
              </Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Elias Thorne"
                className="h-12 bg-[#EAE8E3]/60 border-transparent focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 placeholder:text-[#b5b0a1] rounded-lg text-[15px] text-gray-800 font-medium transition-all"
              />
              {errors.fullName && (
                <p className="text-[11px] text-red-500 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-[#5a6270]">
                Username
              </Label>
              <Input
                id="username"
                {...register('username')}
                placeholder="ethorne_reads"
                className="h-12 bg-[#EAE8E3]/60 border-transparent focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 placeholder:text-[#b5b0a1] rounded-lg text-[15px] text-gray-800 font-medium transition-all"
              />
              {errors.username && (
                <p className="text-[11px] text-red-500 font-medium">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-[#5a6270]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="elias.thorne@curator.com"
              className="h-12 bg-[#EAE8E3]/60 border-transparent focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 placeholder:text-[#b5b0a1] rounded-lg text-[15px] text-gray-800 font-medium transition-all"
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-[#5a6270]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="h-12 bg-[#EAE8E3]/60 border-transparent focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 placeholder:text-[#b5b0a1] rounded-lg text-lg tracking-[0.2em] font-medium text-gray-800 transition-all font-mono"
              />
              {errors.password && (
                <p className="text-[11px] text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-[10px] font-bold uppercase tracking-widest text-[#5a6270]">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                {...register('phoneNumber')}
                placeholder="+1 (555) 000-0000"
                className="h-12 bg-[#EAE8E3]/60 border-transparent focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 placeholder:text-[#b5b0a1] rounded-lg text-[15px] text-gray-800 font-medium transition-all"
              />
              {errors.phoneNumber && (
                <p className="text-[11px] text-red-500 font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-12 bg-[#0A192F] hover:bg-[#162A4B] text-white rounded-lg text-[12px] tracking-[0.15em] uppercase font-bold transition-all shadow-md active:scale-[0.98]" disabled={isSubmitting}>
              {isSubmitting ? 'CREATING...' : 'CREATE ACCOUNT'}
            </Button>
          </div>
        </form>

        <div className="relative pt-8 pb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#EAE8E3]" />
          </div>
          <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold">
            <span className="bg-white px-4 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 bg-[#F6F5F2] hover:bg-[#EAE8E3] border-transparent text-[#161B22] rounded-lg text-[11px] uppercase tracking-[0.15em] font-bold transition-all active:scale-[0.98]"
          onClick={() => authService.googleLogin()}
        >
          <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          SIGN IN WITH GOOGLE
        </Button>

        <div className="text-center pt-8">
          <p className="text-[13px] text-gray-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-[#8B3A2B] hover:text-[#AA4A38] font-bold transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Footer quote outside card */}
      <div className="relative z-10 mt-10 text-center max-w-lg px-4 opacity-80">
        <p className="font-serif italic text-[17px] text-[#5a6270] leading-relaxed">
          &quot;A library is not a luxury but one of the necessities of life.&quot;
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#8e98a8] font-bold">
          — Henry Ward Beecher
        </p>
      </div>
    </div>
  );
}
