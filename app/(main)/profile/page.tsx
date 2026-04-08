'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';
import { ShoppingCart, ShoppingBag, BookMarked, PenTool, Pencil, Package } from 'lucide-react';
import Cookies from 'js-cookie';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HomeFooter } from '@/components/layout/home-footer';
import { HomeHeader } from '@/components/layout/home-header';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);

    useEffect(() => {
        const token = Cookies.get("accessToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.picture) {
                    setGoogleAvatar(payload.picture);
                }
            } catch (e) { }
        }
    }, []);

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FCFBFA]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cd5227]"></div>
            </div>
        );
    }

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Not updated';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#FCFBFA] relative font-sans pb-16">
            <HomeHeader />
            {/* Background Dot Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.15]"
                style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            ></div>

            <div className="container relative mx-auto max-w-5xl py-12 px-4 space-y-12">

                {/* Profile Header Card */}
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-[#EAE8E3]/50 p-8 sm:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar Section */}
                        <div className="relative shrink-0">
                            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#F6F5F2] shadow-sm">
                                <AvatarImage className="object-cover" src={user.avatar || googleAvatar || ""} alt={user.fullName || user.username} />
                                <AvatarFallback className="bg-[#cd5227] text-white text-4xl font-serif">
                                    {(user.fullName || user.username || "?").charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-2 right-2 p-2.5 bg-[#8B3A2B] hover:bg-[#AA4A38] text-white rounded-full shadow-md transition-colors active:scale-95">
                                <Pencil className="w-4 h-4" />
                            </button>
                        </div>

                        {/* User Details */}
                        <div className="text-center md:text-left flex-1 space-y-4 md:mt-2">
                            <div className="space-y-1.5">
                                <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                                    <h1 className="text-4xl md:text-[44px] font-serif text-[#161B22] font-semibold tracking-tight">
                                        {user.fullName || user.username}
                                    </h1>
                                    <span className="px-3 py-1 bg-[#FDF2EC] text-[#EE6337] text-[10px] uppercase tracking-widest font-bold rounded-full">
                                        Member Since {new Date(user.createdAt || Date.now()).getFullYear()}
                                    </span>
                                </div>
                                <p className="text-gray-500 font-medium text-[15px]">{user.email}</p>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                                <Link
                                    href="/profile/edit"
                                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0A192F] hover:bg-[#162A4B] text-white text-sm font-semibold rounded-lg transition-colors active:scale-95 shadow-sm"
                                >
                                    Edit Profile
                                </Link>

                                <button className="px-6 py-2.5 bg-transparent hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg transition-colors active:scale-95">
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-[#EAE8E3]">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 gap-y-10">
                            <div className="space-y-1.5 text-center md:text-left min-w-0 w-full">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Username</p>
                                <p className="text-[#161B22] font-semibold text-[17px] truncate" title={`@${user.username}`}>@{user.username}</p>
                            </div>
                            <div className="space-y-1.5 text-center md:text-left min-w-0 w-full">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Phone Number</p>
                                <p className="text-[#161B22] font-semibold text-[17px] truncate" title={user.phoneNumber || "Not updated"}>
                                    {user.phoneNumber || "Not updated"}
                                </p>
                            </div>
                            <div className="space-y-1.5 text-center md:text-left min-w-0 w-full">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Role</p>
                                <p className="text-[#161B22] font-semibold text-[17px] uppercase tracking-wide truncate">
                                    {user.roles.map(r => r.replace('ROLE_', '')).join(', ') || 'COLLECTOR'}
                                </p>
                            </div>
                            <div className="space-y-1.5 text-center md:text-left min-w-0 w-full">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Joined Date</p>
                                <p className="text-[#161B22] font-semibold text-[17px] truncate">{formatDate(user.createdAt)}</p>
                            </div>

                            <div className="space-y-1.5 text-center md:text-left min-w-0 w-full lg:col-span-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Address</p>
                                <p className="text-[#161B22] font-semibold text-[17px] truncate" title={user.address || "Not updated"}>{user.address || "Not updated"}</p>
                            </div>
                            <div className="space-y-1.5 text-center md:text-left min-w-0 w-full">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Date of Birth</p>
                                <p className="text-[#161B22] font-semibold text-[17px] truncate">{formatDate(user.dateOfBirth)}</p>
                            </div>
                            <div className="space-y-1.5 text-center md:text-left min-w-0 w-full">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Gender</p>
                                <p className="text-[#161B22] font-semibold text-[17px] truncate capitalize">{user.gender || "Not updated"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shopping & Collections Grid */}
                <div className="space-y-6 pt-4">
                    <h2 className="text-[28px] font-serif italic text-[#161B22] tracking-tight text-center md:text-left">
                        Shopping & Collections
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1 */}
                        <Link href="/orders" className="group bg-white p-6 rounded-2xl border border-[#EAE8E3]/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col justify-between">
                            <div className="w-10 h-10 bg-[#F4F2EC] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#EAE8E3] transition-colors">
                                <Package className="w-5 h-5 text-[#161B22] opacity-80" />
                            </div>
                            <div>
                                <h3 className="text-[17px] font-serif text-[#161B22] font-semibold mb-2">My Orders</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Review your recent acquisitions and history.</p>
                            </div>
                        </Link>

                        {/* Card 2 */}
                        <Link href="/cart" className="group bg-white p-6 rounded-2xl border border-[#EAE8E3]/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col justify-between">
                            <div className="w-10 h-10 bg-[#F4F2EC] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#EAE8E3] transition-colors">
                                <ShoppingBag className="w-5 h-5 text-[#161B22] opacity-80" />
                            </div>
                            <div>
                                <h3 className="text-[17px] font-serif text-[#161B22] font-semibold mb-2">Shopping Cart</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Return to your selected volumes and checkout.</p>
                            </div>
                        </Link>

                        {/* Card 3 */}
                        <Link href="/wishlist" className="group bg-white p-6 rounded-2xl border border-[#EAE8E3]/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col justify-between">
                            <div className="w-10 h-10 bg-[#F4F2EC] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#EAE8E3] transition-colors">
                                <BookMarked className="w-5 h-5 text-[#161B22] opacity-80" />
                            </div>
                            <div>
                                <h3 className="text-[17px] font-serif text-[#161B22] font-semibold mb-2">Wishlist</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Discover the titles you've saved for later.</p>
                            </div>
                        </Link>

                        {/* Card 4 */}
                        <Link href="/journal" className="group bg-white p-6 rounded-2xl border border-[#EAE8E3]/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col justify-between">
                            <div className="w-10 h-10 bg-[#F4F2EC] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#EAE8E3] transition-colors">
                                <PenTool className="w-5 h-5 text-[#161B22] opacity-80" />
                            </div>
                            <div>
                                <h3 className="text-[17px] font-serif text-[#161B22] font-semibold mb-2">Reading Journal</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">Chronicle your journey through the written word.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Featured Recommendation */}
                <div className="bg-[#F8F6F2] rounded-[24px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 border border-[#EAE8E3]/60 shadow-sm mt-8">
                    <div className="w-full md:w-1/3 flex justify-center">
                        {/* Book Cover Visualization */}
                        <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] bg-[#161B22] rounded-sm shadow-[8px_12px_24px_rgb(0,0,0,0.2)] flex items-center justify-center p-6 text-center transform -rotate-2 transition-transform hover:rotate-0 duration-300">
                            <div className="border border-[#D4AF37]/40 w-full h-full flex flex-col items-center justify-center p-4">
                                <p className="font-serif text-[#D4AF37] text-[9px] uppercase tracking-widest mb-3 opacity-90">Book Corner</p>
                                <p className="font-serif text-[#D4AF37] text-xl font-bold italic leading-snug">MODERN<br />POETRY</p>
                                <p className="font-serif text-[#D4AF37] text-[8px] uppercase tracking-widest mt-4 opacity-70">Vol. IV</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4 text-center md:text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Curator's Note</p>
                        <h3 className="text-2xl md:text-3xl font-serif italic text-[#161B22] font-semibold leading-relaxed">
                            "A volume specifically curated for your taste in modernist poetry."
                        </h3>
                        <p className="text-gray-500 font-medium text-[14px] leading-relaxed max-w-xl mx-auto md:mx-0">
                            Based on your recent collection, we believe this limited edition pressing of 'The Silent Nocturne' would be a foundational piece for your private library.
                        </p>
                        <div className="pt-3">
                            <button className="px-7 py-3 bg-[#4A1E14] hover:bg-[#34150E] text-white text-[13px] font-bold tracking-wider uppercase rounded-lg transition-all shadow-md active:scale-95">
                                Acquire Volume
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <HomeFooter />
        </div>
    );
}
