'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Package, 
    ChevronRight, 
    ShoppingBag, 
    Calendar, 
    Clock, 
    Truck, 
    CheckCircle2, 
    XCircle,
    ArrowRight,
    Loader2,
    Search
} from 'lucide-react';
import { orderService } from '@/lib/api/services/order.service';
import { OrderResponse, OrderStatus } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/components/layout/home-header';
import { HomeFooter } from '@/components/layout/home-footer';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: any; color: string; bg: string }> = {
    [OrderStatus.PENDING]: { 
        label: 'Pending', 
        icon: Clock, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50' 
    },
    [OrderStatus.SHIPPING]: { 
        label: 'Shipping', 
        icon: Truck, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50' 
    },
    [OrderStatus.DELIVERED]: { 
        label: 'Delivered', 
        icon: CheckCircle2, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50' 
    },
    [OrderStatus.CANCELLED]: { 
        label: 'Cancelled', 
        icon: XCircle, 
        color: 'text-rose-600', 
        bg: 'bg-rose-50' 
    },
};

export default function OrdersPage() {
    const router = useRouter();
    const { isAuthenticated, isInitialized } = useAuthStore();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, isInitialized, router, page]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getMyOrders(page, 10);
            setTotalPages(data.totalPages);
            // Sort by date descending
            const sorted = [...data.content].sort((a, b) => 
                new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
            );
            setOrders(sorted);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

    if (!isInitialized || (isLoading && orders.length === 0)) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
                <HomeHeader />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#EE6337]/60 mx-auto" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Loading your orders...</p>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
            <HomeHeader />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
                <div className="mb-10 space-y-2">
                    <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">Order History</h1>
                    <p className="text-gray-500 font-medium italic">Review and track your literary acquisitions.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-[32px] border border-[#EAE8E3] p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-[#F4F2EC] rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-[#161B22] mb-2">No orders found</h2>
                        <p className="text-gray-400 max-w-xs mx-auto mb-8">You haven't made any purchases yet. Your future collections will appear here.</p>
                        <Button 
                            onClick={() => router.push('/books')}
                            className="bg-[#EE6337] hover:bg-[#cd5227] text-white px-8 h-12 rounded-2xl font-bold shadow-lg active:scale-95"
                        >
                            Start Browsing
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const status = STATUS_CONFIG[order.status];
                            const StatusIcon = status.icon;
                            
                            return (
                                <div 
                                    key={order.id}
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                    className="group bg-white rounded-[24px] border border-[#EAE8E3]/60 p-6 sm:p-8 hover:shadow-xl hover:shadow-[#cd5227]/5 hover:border-[#cd5227]/20 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-6 relative z-10">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${status.bg} ${status.color}`}>
                                                    <StatusIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`text-[11px] font-bold uppercase tracking-widest ${status.color}`}>
                                                        {status.label}
                                                    </p>
                                                    <h3 className="text-lg font-bold text-[#161B22]">Order #{String(order.id).padStart(5, '0')}</h3>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-x-8 gap-y-2 pt-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-600">{formatDate(order.orderDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-600">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:min-w-[120px]">
                                            <p className="text-2xl font-serif font-bold text-[#161B22]">{formatCurrency(order.totalAmount)}</p>
                                            <div className="flex items-center gap-1 text-[13px] font-bold text-[#EE6337] opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Details <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview of item titles */}
                                    <div className="mt-6 pt-6 border-t border-[#F4F2EC] flex items-center justify-between">
                                        <p className="text-[13px] text-gray-400 font-medium line-clamp-1 italic">
                                            {order.orderItems.map(i => i.bookTitle).join(', ')}
                                        </p>
                                    </div>
                                    
                                    {/* Background Accent */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDFCFA] rounded-bl-full -mr-16 -mt-16 opacity-50 group-hover:bg-[#FFF4EC] transition-colors"></div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="border-[#EAE8E3] text-[#161B22] rounded-lg shadow-sm"
                        >
                            Previous
                        </Button>

                        <div className="flex items-center gap-1 mx-2 sm:mx-4 overflow-x-auto">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-all ${
                                        page === i 
                                        ? 'bg-[#161B22] text-white shadow-md' 
                                        : 'text-gray-500 hover:bg-[#EAE8E3]/50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="border-[#EAE8E3] text-[#161B22] rounded-lg shadow-sm"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </main>

            <HomeFooter />
        </div>
    );
}
