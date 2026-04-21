'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { Search, Bell, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export function AdminHeader() {
    const { user, clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await clearAuth();
        router.push('/login');
    };
    return (
        <header className="h-24 px-8 flex items-center justify-between bg-[#FCFBFA] border-b border-transparent shrink-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#161B22] transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search archives..."
                    className="w-full h-11 pl-11 pr-4 bg-[#EBE9E3]/70 focus:bg-[#EBE9E3] border-transparent focus:ring-0 focus:outline-none rounded-full text-[14px] font-medium text-[#161B22] placeholder:text-gray-400 transition-all font-sans"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-8">
                <Link
                    href="/"
                    className="text-[13px] font-semibold text-gray-500 hover:text-[#161B22] transition-colors font-sans"
                >
                    View Store
                </Link>

                <button className="relative text-gray-500 hover:text-[#161B22] transition-colors">
                    <Bell className="h-5 w-5 fill-current" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#C52A1A] rounded-full border-2 border-[#FCFBFA]"></span>
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 pl-2 outline-none hover:opacity-80 transition-opacity">
                        <div className="flex flex-col items-end">
                            <span className="text-[14px] font-bold text-[#161B22] font-sans">
                                {user?.fullName?.split(' ')[0] || user?.username || "Admin"}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-sans">
                                {user?.roles?.[0]?.replace('ROLE_', '') || 'Admin'}
                            </span>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-[#F6F5F2] shadow-sm">
                            <AvatarImage src={user?.avatar || ""} alt="Avatar" className="object-cover" />
                            <AvatarFallback className="bg-[#161B22] text-white text-[13px] font-semibold">
                                {(user?.fullName || user?.username || "?").charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-[#161B22] truncate">{user?.fullName || user?.username || "Admin"}</p>
                                    <p className="text-xs leading-none text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
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
            </div>
        </header>
    );
}
