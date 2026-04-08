'use client';

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminFooter } from "@/components/layout/admin-footer";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Small delay to allow store to rehydrate from persistence
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/unauthorized");
      } else {
        setCheckingAuth(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isAdmin, router]);

  if (checkingAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FCFBFA]">
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 text-[#C52A1A] animate-spin mx-auto" strokeWidth={1.5} />
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-500 animate-pulse">
            Verifying Credentials
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FCFBFA]">
      {/* Sidebar - Fixed Left */}
      <AdminSidebar />

      {/* Main Container - Right side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <AdminHeader />

        {/* Scrollable Main Payload */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-8">
          {children}
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
