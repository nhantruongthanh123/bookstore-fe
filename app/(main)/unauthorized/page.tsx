'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 font-sans bg-[#FCFBFA]">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Animated Icon Container */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-100 rounded-full scale-150 opacity-20 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl border border-red-50">
            <ShieldAlert className="w-16 h-16 text-[#C52A1A]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">
            Access Denied
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C52A1A]">
            Error 403 — Unauthorized Access
          </p>
          <div className="h-px w-12 bg-gray-200 mx-auto my-6"></div>
          <p className="text-[15px] text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
            You do not have the necessary permissions to access the Curator Staff Terminal. 
            This area is restricted to authorized administrative personnel only.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#161B22] hover:bg-[#2d3758] text-white rounded-xl transition-all shadow-md active:scale-95 group"
          >
            <Home className="w-4 h-4" />
            <span className="text-[14px] font-semibold">Return Home</span>
          </Link>
          
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#161B22] rounded-xl transition-all shadow-sm active:scale-95 group"
          >
            <span className="text-[14px] font-semibold">Switch Account</span>
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-[12px] text-gray-400 pt-8">
            Think this is a mistake? Contact the <span className="underline cursor-pointer hover:text-gray-600">system administrator</span>.
        </p>
      </div>
    </div>
  );
}
