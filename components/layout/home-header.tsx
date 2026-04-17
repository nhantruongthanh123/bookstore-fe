"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, UserCircle2, LogOut, User, Loader2, Image as ImageIcon } from "lucide-react";
import { BookResponse } from "@/types";
import { bookService } from "@/lib/api/services/book.service";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Cookies from "js-cookie";

export function HomeHeader() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BookResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const activeClass = "border-b-2 border-[#cd5227] pb-1 font-semibold text-[#cd5227]";
  const inactiveClass = "border-b-2 border-transparent pb-1 transition-colors hover:text-[#2e3547]";

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Debounced Search Setup
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await bookService.searchBooks({ title: searchQuery }, 0, 5);
        setSearchResults(res.content);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on navigation
  useEffect(() => {
    setShowDropdown(false);
    setSearchQuery("");
  }, [pathname]);

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

  const handleLogout = () => {
    Cookies.remove('accessToken');
    clearAuth();
    router.push('/login');
  };

  const cartItemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9d7d1] px-4 py-4 md:px-8">
      <div className="flex items-center gap-8">
        <Link href="/">
          <p className="text-2xl font-semibold italic tracking-tight text-[#24304f]">
            Book Shop
          </p>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[#6d6f79]">
          <Link
            href="/"
            className={pathname === '/' ? activeClass : inactiveClass}
          >
            Home
          </Link>

          <Link
            href="/books"
            className={pathname.startsWith('/books') ? activeClass : inactiveClass}
          >
            Books
          </Link>

          <Link
            href="/orders"
            className={pathname.startsWith('/orders') ? activeClass : inactiveClass}
          >
            Orders
          </Link>

          {isAuthenticated && user?.roles?.includes('ROLE_ADMIN') && (
            <Link
              href="/admin/dashboard"
              className={pathname.startsWith('/admin') ? activeClass : inactiveClass}
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>

      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <div className="relative min-w-48 sm:min-w-72 max-w-sm z-50">
          {isSearching ? (
            <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f8f95] animate-spin" />
          ) : (
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f8f95]" />
          )}
          <input
            type="text"
            placeholder="Search for titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim() && searchResults.length > 0) setShowDropdown(true); }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="h-9 w-full rounded-md border border-[#d7d5cf] bg-[#ecebe8] pl-9 pr-3 text-sm placeholder:text-[#9c9da3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd380d]/30 transition-all font-sans"
          />

          {/* Dropdown Popup */}
          {showDropdown && (
            <div className="absolute top-[calc(100%+8px)] w-full sm:w-[320px] sm:-right-0 sm:left-auto right-0 bg-white border border-[#d9d7d1] shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.length === 0 ? (
                <div className="p-5 text-center text-sm font-medium text-[#6d6f79] italic font-serif">
                  No books found matching "{searchQuery}"
                </div>
              ) : (
                <div className="flex flex-col max-h-[360px] overflow-y-auto w-full">
                  {searchResults.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="flex items-start gap-4 p-3 hover:bg-[#ecebe8] transition-colors border-b border-[#ecebe8] last:border-0"
                    >
                      <div className="w-10 h-[60px] bg-[#d7d5cf]/30 rounded shadow-sm overflow-hidden shrink-0">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover relative z-10" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 justify-center py-1">
                        <p className="text-[14px] font-bold text-[#24304f] truncate leading-tight tracking-tight">
                          {book.title}
                        </p>
                        <p className="text-[12px] text-[#6d6f79] truncate mt-1 italic font-serif">
                          {book.authors?.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <div
                    className="p-3 text-center bg-[#fcfbfa] hover:bg-[#ecebe8] text-[11px] font-bold text-[#cd5227] transition-colors uppercase tracking-widest cursor-pointer underline decoration-transparent hover:decoration-[#cd5227]"
                    onClick={() => {
                      setShowDropdown(false);
                      router.push(`/books?search=${encodeURIComponent(searchQuery)}`);
                    }}
                  >
                    View all query results
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Link
          href="/cart"
          aria-label={`Cart — ${cartItemCount} items`}
          className="relative rounded-full p-2 text-[#2d3758] transition-colors hover:bg-[#e9e8e2]"
        >
          <ShoppingCart className="h-5 w-5" />
          {isAuthenticated && cartItemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EE6337] text-white text-[9px] font-bold leading-none shadow-sm ring-1 ring-white animate-in zoom-in-75 duration-200">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </Link>

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full flex items-center justify-center p-1 text-[#2d3758] transition-colors hover:bg-[#e9e8e2] outline-none">
              <Avatar className="h-7 w-7 border border-[#d7d5cf] shadow-sm">
                <AvatarImage src={user.avatar || googleAvatar || ""} alt={user.fullName || user.username} />
                <AvatarFallback className="bg-[#cd5227] text-white text-[10px] font-semibold">
                  {(user.fullName || user.username || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-[#161B22] truncate">{user.fullName || user.username}</p>
                    <p className="text-xs leading-none text-gray-500 truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
