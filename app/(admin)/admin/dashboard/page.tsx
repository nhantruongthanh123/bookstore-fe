'use client';

import { useAuthStore } from '@/lib/store/authStore';
import {
    CalendarDays,
    Banknote,
    ShoppingBag,
    Users,
    AlertTriangle,
    TrendingUp,
    Loader2,
    BookOpen
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { dashboardService } from '@/lib/api/services/dashboard.service';
import { DashboardResponse, OrderStatus } from '@/types';

export default function AdminDashboardPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const adminName = user?.fullName?.split(' ')[0] || user?.username || "Admin";

    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartHoverIdx, setChartHoverIdx] = useState<number | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await dashboardService.getDashboardData();
                setData(res);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const formatCurrency = (n: number | undefined) =>
        (n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <Loader2 className="w-12 h-12 animate-spin text-[#EE6337] mx-auto opacity-70" />
                <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mt-4">Loading Dashboard Data...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto opacity-70" />
                <p className="text-[15px] font-bold text-gray-500 mt-4">Failed to load dashboard data</p>
            </div>
        );
    }

    const todayStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const lastWeekStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    // Helper for donut chart colors
    const colors = ['#162A4B', '#EE6337', '#2A5C9A', '#7C3AED'];

    return (
        <div className="px-8 lg:px-12 max-w-[1600px] mx-auto space-y-8 font-sans pb-12">

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
                    <span className="text-[13px] font-semibold tracking-wide flex items-center gap-2">
                        <span>{lastWeekStr}</span>
                        <span className="text-gray-400">—</span>
                        <span>{todayStr}</span>
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
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] text-gray-500 font-medium">Weekly Revenue</p>
                        <h2 className="text-3xl font-serif font-bold text-[#161B22] tracking-tight">
                            {formatCurrency(data.weeklyRevenue)}
                        </h2>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 flex flex-col justify-between h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-[#F5F4F0] flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-[12px] font-semibold text-gray-500">+{data.orderToday} today</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] text-gray-500 font-medium">Weekly Orders</p>
                        <h2 className="text-3xl font-serif font-bold text-[#161B22] tracking-tight">{data.orderInWeek}</h2>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 flex flex-col justify-between h-[180px]">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-[#EAEFFD] flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#2A5C9A]" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] text-gray-500 font-medium">Active Users</p>
                        <h2 className="text-3xl font-serif font-bold text-[#161B22] tracking-tight">{data.totalActiveUsers}</h2>
                    </div>
                </div>

                {/* Metric 4 (Alert) */}
                <div className="bg-[#FFEFEA] p-6 rounded-2xl shadow-[0_4px_24px_rgb(238,99,55,0.1)] border border-[#FFE0D5] flex flex-col justify-between h-[180px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDFD4] rounded-bl-full opacity-30 -mr-8 -mt-8 pointer-events-none"></div>
                    <div className="w-10 h-10 rounded-lg bg-[#C52A1A] flex items-center justify-center relative z-10 cursor-pointer" onClick={() => data.alertBook ? router.push(`/admin/shop/books/${data.alertBook.id}`) : router.push('/admin/shop/books')}>
                        <AlertTriangle className="w-5 h-5 text-white" />
                    </div>

                    <div className="space-y-0.5 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#C52A1A]">
                            Low Stock Alert
                        </p>
                        {data.alertBook ? (
                            <>
                                <h2 className="text-3xl font-serif font-bold text-[#C52A1A] tracking-tight truncate pr-4" title={data.alertBook.title}>
                                    {data.alertBook.quantity} Left
                                </h2>
                                <p className="text-[12px] font-medium text-[#C52A1A]/80 pt-1 line-clamp-1">
                                    "{data.alertBook.title}" needs restock
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-serif font-bold text-[#C52A1A] tracking-tight">All Good</h2>
                                <p className="text-[12px] font-medium text-[#C52A1A]/80 pt-1">
                                    Inventory levels are healthy
                                </p>
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Revenue Growth Chart */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 p-6 sm:p-8 flex flex-col min-h-[480px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-[#161B22]">Revenue Growth</h3>
                            <p className="text-[13px] font-medium text-gray-400 italic">Last 7 days performance</p>
                        </div>
                        <div className="px-3 py-1.5 bg-[#F6F5F2] hover:bg-[#EBE9E3] rounded-lg cursor-pointer transition-colors text-[12px] font-semibold text-[#161B22]">
                            Last 7 Days
                        </div>
                    </div>

                    {/* Modern Area Chart graphic based on dailyRevenue */}
                    <div className="flex-1 w-full relative mt-8 -mx-2 px-2 flex flex-col justify-end">
                        {(() => {
                            const chartData = data.dailyRevenue.slice(0, 7);
                            const maxAmt = Math.max(...chartData, 100);

                            const points = chartData.map((amt, idx) => {
                                const x = idx * 100;
                                const y = 200 - ((amt / maxAmt) * 160);
                                return { x, y };
                            });

                            let linePath = `M${points[0].x},${points[0].y}`;
                            for (let i = 1; i < points.length; i++) {
                                const midX = (points[i - 1].x + points[i].x) / 2;
                                linePath += ` C ${midX},${points[i - 1].y} ${midX},${points[i].y} ${points[i].x},${points[i].y}`;
                            }

                            const areaPath = `${linePath} L600,200 L0,200 Z`;

                            return (
                                <>
                                    <div className="absolute inset-0 pb-8 flex items-end pointer-events-none">
                                        <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                            <defs>
                                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#2A5C9A" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#2A5C9A" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>

                                            {/* Horizontal Gridlines (faint dashed) */}
                                            <g stroke="#EAE8E3" strokeDasharray="4 4" strokeWidth="1" className="opacity-60">
                                                <line x1="0" y1="40" x2="600" y2="40" />
                                                <line x1="0" y1="80" x2="600" y2="80" />
                                                <line x1="0" y1="120" x2="600" y2="120" />
                                                <line x1="0" y1="160" x2="600" y2="160" />
                                            </g>

                                            <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-500" />
                                            <path d={linePath} fill="none" stroke="#2A5C9A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500" />

                                            {/* Data point dots (Visible only on hover or if today and hovered) */}
                                            {points.map((pt, idx) => (
                                                <circle
                                                    key={`dot-${idx}`}
                                                    cx={pt.x}
                                                    cy={pt.y}
                                                    r="5"
                                                    fill="#FFFFFF"
                                                    stroke="#EE6337"
                                                    strokeWidth="2.5"
                                                    className="transition-all duration-300"
                                                    opacity={chartHoverIdx === idx ? 1 : 0}
                                                />
                                            ))}
                                        </svg>
                                    </div>

                                    {/* Overlays for interaction and Labels */}
                                    <div className="absolute inset-0 z-10 w-full h-full pb-0 pointer-events-none">
                                        {chartData.map((amount, idx) => {
                                            const d = new Date(Date.now() - (6 - idx) * 24 * 60 * 60 * 1000);
                                            const isToday = idx === chartData.length - 1;
                                            const label = isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                                            const leftPercent = (idx / (chartData.length - 1)) * 100;

                                            return (
                                                <div
                                                    key={`col-${idx}`}
                                                    className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-auto cursor-crosshair group"
                                                    style={{ left: `${leftPercent}%`, width: '14.28%', transform: 'translateX(-50%)' }}
                                                    onMouseEnter={() => setChartHoverIdx(idx)}
                                                    onMouseLeave={() => setChartHoverIdx(null)}
                                                >
                                                    {/* Invisible hover track vertical line */}
                                                    <div className={`absolute top-0 bottom-8 w-px transition-colors pointer-events-none ${chartHoverIdx === idx ? 'bg-gray-300' : 'bg-transparent'}`} />

                                                    {/* Tooltip */}
                                                    <span className={`absolute top-4 bg-[#161B22] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl transition-all z-20 pointer-events-none transform text-center whitespace-nowrap ${chartHoverIdx === idx ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                                                        {formatCurrency(amount)}
                                                    </span>

                                                    {/* Label at bottom */}
                                                    <span className={`absolute bottom-1 bg-white/60 px-1.5 rounded backdrop-blur-sm text-[10px] md:text-[11px] font-bold tracking-wider ${isToday ? 'text-[#EE6337]' : 'text-gray-400'} whitespace-nowrap`}>
                                                        {label}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>

                {/* Genre Distribution Card */}
                <div className="bg-[#F8F6F2] rounded-2xl border border-[#EAE8E3] p-6 sm:p-8 flex flex-col min-h-[480px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <h3 className="text-xl font-serif font-bold text-[#161B22] text-center mb-6">Category Distribution</h3>

                    {/* Donut Chart Implementation - Flat & Clean */}
                    <div className="flex-1 flex flex-col items-center justify-center relative pb-6 mt-2">
                        {data.topCategories.length > 0 ? (
                            <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90">
                                {(() => {
                                    const circumference = 2 * Math.PI * 40;
                                    const strokeWidth = 16; // Increased thickness to match image
                                    const gapDegrees = 3; // 3 degrees gap
                                    const gapUnits = (gapDegrees / 360) * circumference;
                                    let cumulativePercent = 0;

                                    const allSegments = data.topCategories.map((cat, i) => ({
                                        name: cat.name,
                                        percent: data.percentOfTopCategories[i] || 0,
                                        color: colors[i % colors.length]
                                    }));

                                    const totalTopPercent = allSegments.reduce((sum, s) => sum + s.percent, 0);
                                    if (totalTopPercent < 99.9) {
                                        allSegments.push({
                                            name: 'Others',
                                            percent: 100 - totalTopPercent,
                                            color: '#D1D5DB'
                                        });
                                    }

                                    return allSegments.map((seg, i) => {
                                        const segmentUnits = (seg.percent / 100) * circumference;
                                        // Subtract gapUnits from each segment to create flat white gaps
                                        const dashLength = Math.max(0, segmentUnits - gapUnits);
                                        const dashArray = `${dashLength} ${circumference}`;

                                        // Offset starts at cumulative point + half gap to keep it centered
                                        const dashOffset = -((cumulativePercent / 100) * circumference + gapUnits / 2);

                                        cumulativePercent += seg.percent;

                                        return (
                                            <circle
                                                key={i} cx="50" cy="50" r="40"
                                                fill="transparent"
                                                stroke={seg.color}
                                                strokeWidth={strokeWidth}
                                                strokeDasharray={dashArray}
                                                strokeDashoffset={dashOffset}
                                                strokeLinecap="butt"
                                                className="transition-all duration-700 ease-out"
                                            />
                                        );
                                    });
                                })()}
                            </svg>
                        ) : (
                            <div className="w-48 h-48 rounded-full border-[16px] border-[#EAE8E3] flex items-center justify-center">
                                <span className="text-[12px] font-bold text-gray-400">No Data</span>
                            </div>
                        )}

                        <div className="absolute inset-0 pb-8 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Total</span>
                            <span className="text-[17px] font-serif font-bold text-[#161B22]">Categories</span>
                        </div>
                    </div>

                    {/* Legend in 2x2 Grid Layout */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-[#EAE8E3]">
                        {(() => {
                            const allDisplay = data.topCategories.map((cat, i) => ({
                                name: cat.name,
                                percent: data.percentOfTopCategories[i] || 0,
                                color: colors[i % colors.length]
                            }));

                            const totalTopPercent = allDisplay.reduce((sum, s) => sum + s.percent, 0);
                            if (totalTopPercent < 99.9) {
                                allDisplay.push({
                                    name: 'Others',
                                    percent: 100 - totalTopPercent,
                                    color: '#D1D5DB'
                                });
                            }

                            return allDisplay.slice(0, 4).map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-1 group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#EE6337] transition-colors truncate" title={item.name}>{item.name}</span>
                                    </div>
                                    <span className="text-lg font-serif font-bold text-[#161B22] pl-4">
                                        {item.percent.toFixed(1)}%
                                    </span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

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
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">User ID</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Amount</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px]">
                                {data.recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[13px] font-medium text-gray-400">
                                            No recent orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0 border-[#EAE8E3]/40 hover:bg-[#F8F6F2] transition-colors cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                            <td className="px-6 py-5 font-bold text-[#161B22]">#{String(order.id).padStart(5, '0')}</td>
                                            <td className="px-6 py-5 font-medium text-gray-600">User {order.userId}</td>
                                            <td className="px-6 py-5 text-[#161B22] font-bold">{formatCurrency(order.totalAmount)}</td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${order.status === OrderStatus.DELIVERED ? 'bg-[#E9F6EF] text-[#2F7E4C]' :
                                                    order.status === OrderStatus.CANCELLED ? 'bg-[#FFF4F3] text-[#C52A1A]' :
                                                        'bg-[#EAE8E3] text-[#161B22]'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="text-[12px] font-bold text-[#EE6337] hover:underline" onClick={(e) => { e.stopPropagation(); router.push(`/admin/orders/${order.id}`); }}>View →</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Sellers */}
                <div>
                    <h3 className="text-2xl font-serif font-bold text-[#161B22] mb-4">Top Sellers</h3>

                    <div className="space-y-4 mb-6">
                        {data.topSellerBooks.length === 0 ? (
                            <div className="bg-white border border-[#EAE8E3]/50 rounded-2xl p-6 text-center shadow-sm">
                                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <span className="text-[13px] font-medium text-gray-400">No sales data available.</span>
                            </div>
                        ) : (
                            data.topSellerBooks.map((book, idx) => (
                                <div key={book.id} className="flex gap-4 p-3 bg-white rounded-2xl border border-[#EAE8E3]/50 shadow-sm hover:border-[#EE6337]/30 transition-colors cursor-pointer" onClick={() => router.push(`/admin/shop/books/${book.id}`)}>
                                    <div className="w-16 h-20 bg-[#F6F5F2] rounded-lg shrink-0 border border-[#EAE8E3] overflow-hidden relative flex items-center justify-center">
                                        {book.coverImage ? (
                                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <BookOpen className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center space-y-1 overflow-hidden">
                                        {idx === 0 && <span className="text-[9px] font-bold uppercase tracking-widest text-[#EE6337]">#1 Trending</span>}
                                        <h4 className="text-[15px] font-serif font-bold text-[#161B22] leading-tight truncate" title={book.title}>{book.title}</h4>
                                        <p className="text-[12px] italic text-gray-500 font-serif truncate">by {book.authors.map(author => author.name).join(', ')}</p>
                                        <p className="text-[12px] font-semibold text-[#2F7E4C] pt-0.5">{data.numberOfBooksInWeek[idx]} sold this week</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={() => router.push('/admin/shop/books')}
                        className="w-full py-3.5 bg-[#EBE9E3] hover:bg-[#EAE8E3] text-[#161B22] text-[13px] font-semibold tracking-wide rounded-xl transition-colors shadow-sm active:scale-95 flex justify-center items-center gap-2"
                    >
                        View Full Catalog <span className="text-lg leading-none mb-0.5">→</span>
                    </button>
                </div>

            </div>
        </div>
    );
}

