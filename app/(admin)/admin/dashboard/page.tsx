'use client';

import { useAuthStore } from '@/lib/store/authStore';
import {
    CalendarDays,
    Banknote,
    ShoppingBag,
    Users,
    AlertTriangle,
    TrendingUp,
    MoreVertical
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const adminName = user?.fullName?.split(' ')[0] || user?.username || "Admin";

    return (
        <div className="px-8 lg:px-12 max-w-[1600px] mx-auto space-y-8 font-sans">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                        Dashboard Overview
                    </p>
                    <h1 className="text-4xl md:text-[42px] font-serif font-semibold text-[#161B22] tracking-tight">
                        Welcome back, {adminName}!
                    </h1>
                    <p className="text-[14px] text-gray-500 font-medium">
                        Here&apos;s what&apos;s happening with your store today.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#F6F5F2] hover:bg-[#EBE9E3] rounded-xl transition-colors cursor-pointer text-[#161B22]">
                    <CalendarDays className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-semibold tracking-wide">
                        Oct 24, 2023 — Nov 23, 2023
                    </span>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Metric 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 flex flex-col justify-between h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-[#EAEFFD] flex items-center justify-center">
                            <Banknote className="w-5 h-5 text-[#2A5C9A]" />
                        </div>
                        <div className="bg-[#E9F6EF] text-[#2F7E4C] px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[11px] font-bold">+12%</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] text-gray-500 font-medium">Total Revenue</p>
                        <h2 className="text-3xl font-serif font-bold text-[#161B22] tracking-tight">$42,850.00</h2>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 flex flex-col justify-between h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-[#F5F4F0] flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-[12px] font-semibold text-gray-500">+8 today</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] text-gray-500 font-medium">Total Orders</p>
                        <h2 className="text-3xl font-serif font-bold text-[#161B22] tracking-tight">1,284</h2>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 flex flex-col justify-between h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-[#EAEFFD] flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#2A5C9A]" />
                        </div>
                        <div className="flex -space-x-2">
                            <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-[#C52A1A] text-white text-[9px]">A</AvatarFallback>
                            </Avatar>
                            <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-[#161B22] text-white text-[9px]">JD</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] text-gray-500 font-medium">Active Users</p>
                        <h2 className="text-3xl font-serif font-bold text-[#161B22] tracking-tight">856</h2>
                    </div>
                </div>

                {/* Metric 4 (Alert) */}
                <div className="bg-[#FFEFEA] p-6 rounded-2xl shadow-[0_4px_24px_rgb(238,99,55,0.1)] border border-[#FFE0D5] flex flex-col justify-between h-[180px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDFD4] rounded-bl-full opacity-30 -mr-8 -mt-8 pointer-events-none"></div>
                    <div className="w-10 h-10 rounded-lg bg-[#C52A1A] flex items-center justify-center relative z-10">
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>

                    <div className="space-y-0.5 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#C52A1A]">
                            Low Stock Alert
                        </p>
                        <h2 className="text-3xl font-serif font-bold text-[#C52A1A] tracking-tight">12 Items</h2>
                        <p className="text-[12px] font-medium text-[#C52A1A]/80 pt-1">
                            Requires immediate restock
                        </p>
                    </div>
                </div>

            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Revenue Growth Chart */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 p-6 sm:p-8 flex flex-col h-[420px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-[#161B22]">Revenue Growth</h3>
                            <p className="text-[13px] font-medium text-gray-400 italic">30-day performance trend</p>
                        </div>
                        <div className="px-3 py-1.5 bg-[#F6F5F2] hover:bg-[#EBE9E3] rounded-lg cursor-pointer transition-colors text-[12px] font-semibold text-[#161B22]">
                            Last 30 Days ▾
                        </div>
                    </div>

                    {/* Placeholder Chart Graphic */}
                    <div className="flex-1 w-full bg-[#F6F5F2] rounded-xl relative overflow-hidden flex items-end">
                        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-3/4 fill-current text-[#D1D5DB] opacity-80">
                            <path d="M0,40 L0,25 C10,25 15,28 25,26 C35,24 40,15 50,18 C60,21 65,10 75,12 C85,14 90,5 100,2 L100,40 Z" />
                        </svg>

                        {/* Fake X-axis */}
                        <div className="absolute bottom-4 left-0 w-full px-6 flex justify-between text-[10px] font-bold tracking-widest text-gray-500 z-10">
                            <span>01 OCT</span>
                            <span>07 OCT</span>
                            <span>14 OCT</span>
                            <span>21 OCT</span>
                            <span>28 OCT</span>
                        </div>
                    </div>
                </div>

                {/* Genre Distribution */}
                <div className="bg-[#F6F5F2] rounded-2xl border border-[#EAE8E3]/50 p-6 sm:p-8 flex flex-col h-[420px]">
                    <h3 className="text-2xl font-serif font-bold text-[#161B22] text-center mb-8">Genre Distribution</h3>

                    {/* Donut Chart Mockup */}
                    <div className="flex-1 flex flex-col items-center justify-center relative pb-8">
                        {/* Fake Donut SVG */}
                        <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-md">
                            {/* Blue Arc */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#162A4B" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" className="origin-center -rotate-90" />
                            {/* Red Arc */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#5E180A" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="180" strokeLinecap="round" className="origin-center rotate-[45deg]" />
                            {/* White Arc */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="210" strokeLinecap="round" className="origin-center rotate-[150deg]" />
                        </svg>

                        <div className="absolute inset-0 pb-8 flex flex-col items-center justify-center">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Total</span>
                            <span className="text-[17px] font-serif font-bold text-[#161B22]">Genres</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-4 px-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-[#162A4B] rounded-sm"></div>
                                <span className="text-[13px] font-medium text-gray-500">Fiction & Poetry</span>
                            </div>
                            <span className="text-[13px] font-bold text-[#161B22]">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-[#5E180A] rounded-sm"></div>
                                <span className="text-[13px] font-medium text-gray-500">IT & Engineering</span>
                            </div>
                            <span className="text-[13px] font-bold text-[#161B22]">30%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-[#E2E8F0] rounded-sm"></div>
                                <span className="text-[13px] font-medium text-gray-500">Psychology</span>
                            </div>
                            <span className="text-[13px] font-bold text-[#161B22]">25%</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-8">

                {/* Recent Orders */}
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-serif font-bold text-[#161B22]">Recent Orders</h3>
                        <span
                            onClick={() => router.push('/admin/orders')}
                            className="text-[12px] font-bold text-[#161B22] underline cursor-pointer hover:text-[#EE6337] transition-colors"
                        >
                            View All Orders
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8F6F2] border-b border-[#EAE8E3]">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Customer</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Amount</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px]">
                                <tr className="border-b border-[#EAE8E3]/40 hover:bg-[#F8F6F2] transition-colors">
                                    <td className="px-6 py-5 font-medium text-gray-500">#CR-9201</td>
                                    <td className="px-6 py-5 font-bold text-[#161B22]">Amara Walker</td>
                                    <td className="px-6 py-5 text-gray-600 font-medium">$84.50</td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#EAE8E3] text-[#161B22] rounded-md">Pending</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="px-4 py-2 bg-[#161B22] text-white text-[12px] font-semibold rounded-lg hover:bg-[#2d3758] transition-colors">Approve</button>
                                    </td>
                                </tr>
                                <tr className="border-b border-[#EAE8E3]/40 hover:bg-[#F8F6F2] transition-colors">
                                    <td className="px-6 py-5 font-medium text-gray-500">#CR-9202</td>
                                    <td className="px-6 py-5 font-bold text-[#161B22]">Julian Barnes</td>
                                    <td className="px-6 py-5 text-gray-600 font-medium">$120.00</td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#E9F6EF] text-[#2F7E4C] rounded-md">Shipped</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-gray-400 hover:text-[#161B22] transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-[#F8F6F2] transition-colors">
                                    <td className="px-6 py-5 font-medium text-gray-500">#CR-9203</td>
                                    <td className="px-6 py-5 font-bold text-[#161B22]">Elena Ross</td>
                                    <td className="px-6 py-5 text-gray-600 font-medium">$45.20</td>
                                    <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#EAE8E3] text-[#161B22] rounded-md">Pending</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="px-4 py-2 bg-[#161B22] text-white text-[12px] font-semibold rounded-lg hover:bg-[#2d3758] transition-colors">Approve</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Sellers */}
                <div>
                    <h3 className="text-2xl font-serif font-bold text-[#161B22] mb-4">Top Sellers</h3>

                    <div className="space-y-6 mb-6">
                        {/* Item 1 */}
                        <div className="flex gap-4">
                            <div className="w-16 h-[88px] bg-gray-200 rounded-md shrink-0 border border-[#EAE8E3] overflow-hidden relative shadow-sm">
                                {/* Use empty colored block as placeholder for books since we don't have images loaded */}
                                <div className="absolute inset-0 bg-[#E8DCCB]"></div>
                                <div className="absolute left-1.5 inset-y-0 w-px bg-black/10"></div>
                            </div>
                            <div className="flex flex-col justify-center space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#EE6337]">#1 Trending</span>
                                <h4 className="text-[16px] font-serif font-bold text-[#161B22] leading-tight">The Midnight Archive</h4>
                                <p className="text-[12px] italic text-gray-500 font-serif">by Evelyn Thorne</p>
                                <p className="text-[12px] font-semibold text-[#161B22] pt-1">142 sold this week</p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex gap-4">
                            <div className="w-16 h-[88px] bg-gray-200 rounded-md shrink-0 border border-[#EAE8E3] overflow-hidden relative shadow-sm">
                                <div className="absolute inset-0 bg-[#2A5C9A]"></div>
                                <div className="absolute left-1.5 inset-y-0 w-px bg-black/20"></div>
                            </div>
                            <div className="flex flex-col justify-center space-y-1">
                                <h4 className="text-[16px] font-serif font-bold text-[#161B22] leading-tight">Digital Renaissance</h4>
                                <p className="text-[12px] italic text-gray-500 font-serif">by Marcus Chen</p>
                                <p className="text-[12px] font-semibold text-[#161B22] pt-1">98 sold this week</p>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="flex gap-4">
                            <div className="w-16 h-[88px] bg-gray-200 rounded-md shrink-0 border border-[#EAE8E3] overflow-hidden relative shadow-sm">
                                <div className="absolute inset-0 bg-[#4A2D1F]"></div>
                                <div className="absolute left-1.5 inset-y-0 w-px bg-black/30"></div>
                            </div>
                            <div className="flex flex-col justify-center space-y-1">
                                <h4 className="text-[16px] font-serif font-bold text-[#161B22] leading-tight">Quiet Minds</h4>
                                <p className="text-[12px] italic text-gray-500 font-serif">by Dr. Sarah Laine</p>
                                <p className="text-[12px] font-semibold text-[#161B22] pt-1">76 sold this week</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/admin/shop/books')}
                        className="w-full py-3.5 bg-[#EBE9E3] hover:bg-[#EAE8E3] text-[#161B22] text-[13px] font-semibold tracking-wide rounded-xl transition-colors shadow-sm active:scale-95"
                    >
                        View Full Catalog
                    </button>
                </div>

            </div>
        </div>
    );
}
