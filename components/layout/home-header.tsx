"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Cookies from "js-cookie";

export function HomeHeader() {
  const { user, isAuthenticated } = useAuthStore();
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const token = Cookies.get("accessToken");
      if (token) {
        try {
          // Decode the JWT payload to look for Google's picture claim
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.picture) {
            setGoogleAvatar(payload.picture);
          }
        } catch (e) {
          // Fallback gracefully if parsing fails
        }
      }
    }
  }, [isAuthenticated]);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9d7d1] px-4 py-4 md:px-8">
      <div className="flex items-center gap-8">
        <p className="text-2xl font-semibold italic tracking-tight text-[#24304f]">
          Book Shop
        </p>
        <nav className="flex items-center gap-5 text-sm text-[#6d6f79]">
          <Link
            href="/books"
            className="border-b-2 border-[#cd5227] pb-1 font-semibold text-[#cd5227]"
          >
            Browse
          </Link>
          <Link href="/books" className="transition-colors hover:text-[#2e3547]">
            Collections
          </Link>
          <Link href="/orders" className="transition-colors hover:text-[#2e3547]">
            Journal
          </Link>
        </nav>
      </div>

      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <div className="relative min-w-48">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f8f95]" />
          <input
            type="text"
            placeholder="Search for titles..."
            className="h-9 w-full rounded-md border border-[#d7d5cf] bg-[#ecebe8] pl-9 pr-3 text-sm placeholder:text-[#9c9da3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6266f0]/50"
          />
        </div>
        <Link
          href="/cart"
          aria-label="Cart"
          className="rounded-full p-2 text-[#2d3758] transition-colors hover:bg-[#e9e8e2]"
        >
          <ShoppingCart className="h-5 w-5" />
        </Link>

        {isAuthenticated && user ? (
          <Link
            href="/profile"
            aria-label="Profile"
            className="rounded-full flex items-center justify-center p-1 text-[#2d3758] transition-colors hover:bg-[#e9e8e2]"
          >
            <Avatar className="h-7 w-7 border border-[#d7d5cf] shadow-sm">
              <AvatarImage src={googleAvatar || ""} alt={user.fullName || user.username} />
              <AvatarFallback className="bg-[#cd5227] text-white text-[10px] font-semibold">
                {(user.fullName || user.username || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link
            href="/profile"
            aria-label="Account"
            className="rounded-full p-2 text-[#2d3758] transition-colors hover:bg-[#e9e8e2]"
          >
            <UserCircle2 className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
