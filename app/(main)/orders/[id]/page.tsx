'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Calendar, 
    CreditCard, 
    Package, 
    Clock, 
    Truck, 
    CheckCircle2, 
    XCircle,
    Loader2,
    AlertCircle,
    ShoppingBag,
    Trash2
} from 'lucide-react';
import { orderService } from '@/lib/api/services/order.service';
import { OrderResponse, OrderStatus } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/components/layout/home-header';
import { HomeFooter } from '@/components/layout/home-footer';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: any; color: string; bg: string; description: string }> = {
    [OrderStatus.PENDING]: { 
        label: 'Order Pending', 
        icon: Clock, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        description: 'We have received your order and are currently processing it.'
    },
    [OrderStatus.SHIPPING]: { 
        label: 'In Transit', 
        icon: Truck, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        description: 'Your package is on its way to your destination.'
    },
    [OrderStatus.DELIVERED]: { 
        label: 'Delivered', 
        icon: CheckCircle2, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50',
        description: 'The package has been successfully delivered.'
    },
    [OrderStatus.CANCELLED]: { 
        label: 'Cancelled', 
        icon: XCircle, 
        color: 'text-rose-600', 
        bg: 'bg-rose-50',
        description: 'This order has been cancelled and will not be processed further.'
    },
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = Number(params.id);
    
    const { isAuthenticated, isInitialized } = useAuthStore();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated && orderId) {
            fetchOrderDetail();
        }
    }, [isAuthenticated, isInitialized, orderId, router]);

    const fetchOrderDetail = async () => {
        try {
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order detail:', error);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || order.status !== OrderStatus.PENDING) return;
        
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setIsCancelling(true);
        try {
            await orderService.cancelOrder(order.id);
            await fetchOrderDetail(); // Refresh data
        } catch (error) {
            alert('Failed to cancel order. Please try again.');
        } finally {
            setIsCancelling(false);
        }
    };

    const formatCurrency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
                <HomeHeader />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#EE6337]/60" />
                </div>
                <HomeFooter />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
                <HomeHeader />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-sm px-4">
                        <AlertCircle className="w-12 h-12 text-rose-300 mx-auto" />
                        <h2 className="text-2xl font-serif font-bold text-[#161B22]">Order Not Found</h2>
                        <p className="text-gray-400">We couldn't find the order you're looking for. It may have been removed or the ID is incorrect.</p>
                        <Button onClick={() => router.push('/orders')} className="bg-[#0A192F] text-white rounded-xl">
                            Back to Orders
                        </Button>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    const status = STATUS_CONFIG[order.status];
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
            <HomeHeader />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                {/* Back Link */}
                <button 
                    onClick={() => router.push('/orders')}
                    className="flex items-center gap-2 text-[13px] font-bold text-gray-400 hover:text-[#EE6337] transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to History
                </button>

                <div className="space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#EAE8E3]">
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EE6337]">Purchase Confirmation</p>
                            <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">Order #{String(order.id).padStart(5, '0')}</h1>
                            <div className="flex items-center gap-2 text-gray-500 font-medium">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(order.orderDate)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${status.bg} ${status.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                <span className="text-sm font-bold tracking-wide">{status.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Description Card */}
                    <div className="bg-white rounded-3xl border border-[#EAE8E3]/60 p-6 flex items-start gap-4">
                        <div className={`shrink-0 p-3 rounded-2xl ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#161B22] mb-1">{status.label}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{status.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[32px] border border-[#EAE8E3]/60 overflow-hidden">
                                <div className="px-8 py-6 border-b border-[#F4F2EC] flex items-center gap-3">
                                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                                    <h2 className="font-bold text-[#161B22]">Order Items ({order.orderItems.length})</h2>
                                </div>
                                <div className="divide-y divide-[#F4F2EC]">
                                    {order.orderItems.map((item) => (
                                        <div key={item.id} className="p-8 flex items-center gap-6 group hover:bg-[#FDFCFA] transition-colors">
                                            <div className="w-16 h-20 bg-[#F4F2EC] rounded-lg border border-[#EAE8E3]/50 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden">
                                                <Package className="w-8 h-8 text-gray-300" />
                                                <div className="absolute left-1 inset-y-0 w-px bg-black/5"></div>
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-serif font-bold text-[#161B22] group-hover:text-[#EE6337] transition-colors cursor-pointer" onClick={() => router.push(`/books/${item.bookId}`)}>
                                                    {item.bookTitle}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <p className="text-[13px] text-gray-500 font-medium">Qty: {item.quantity}</p>
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                    <p className="text-[13px] text-gray-500 font-medium">{formatCurrency(item.price)} each</p>
                                                </div>
                                            </div>
                                            <p className="font-serif font-bold text-[#161B22]">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-[#161B22] text-white rounded-[32px] p-8 space-y-8 shadow-xl shadow-[#161B22]/10 relative overflow-hidden">
                                {/* Background design element */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                
                                <h3 className="text-xl font-serif font-bold relative z-10 italic">Summary</h3>
                                
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between text-gray-400 text-sm font-medium">
                                        <span>Subtotal</span>
                                        <span className="text-white">{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-sm font-medium">
                                        <span>Shipping</span>
                                        <span className="text-[#2F7E4C] font-bold">Free</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between">
                                        <span className="font-bold">Total Amount</span>
                                        <span className="text-2xl font-serif font-bold text-[#EE6337]">
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl relative z-10 border border-white/5">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Payment</p>
                                        <p className="text-sm font-semibold">Cash on Delivery</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Section */}
                            {order.status === OrderStatus.PENDING && (
                                <div className="bg-rose-50 rounded-[32px] p-8 border border-rose-100 space-y-4">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <Trash2 className="w-4 h-4" />
                                        <h3 className="font-bold">Need to cancel?</h3>
                                    </div>
                                    <p className="text-[13px] text-rose-600/70 font-medium leading-relaxed">
                                        You can cancel this order while it is still pending. Once processed, it cannot be revoked.
                                    </p>
                                    <Button
                                        onClick={handleCancelOrder}
                                        disabled={isCancelling}
                                        className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all text-[13px] uppercase tracking-wider"
                                    >
                                        {isCancelling ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cancelling...</>
                                        ) : (
                                            'Cancel Order'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <HomeFooter />
        </div>
    );
}
