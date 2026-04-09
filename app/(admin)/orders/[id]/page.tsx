'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    User,
    Calendar,
    ShoppingBag,
    Clock,
    Truck,
    PackageCheck,
    XCircle,
} from 'lucide-react';
import { orderService } from '@/lib/api/services/order.service';
import { OrderResponse, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { StatusBadge, STATUS_CONFIG } from '../page';

// Pipeline for the 4 statuses
const STATUS_PIPELINE: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
];

const PIPELINE_ICONS: Record<string, React.ReactNode> = {
    [OrderStatus.PENDING]: <Clock className="w-4 h-4" />,
    [OrderStatus.SHIPPING]: <Truck className="w-4 h-4" />,
    [OrderStatus.DELIVERED]: <PackageCheck className="w-4 h-4" />,
};

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = Number(params.id);

    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(false);

    const fetchOrder = async () => {
        setIsLoading(true);
        setError(false);
        try {
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
        } catch (err) {
            console.error('Failed to load order', err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);

    const nextStatus = (current: OrderStatus): OrderStatus | null => {
        const idx = STATUS_PIPELINE.indexOf(current);
        if (idx === -1 || idx === STATUS_PIPELINE.length - 1) return null;
        return STATUS_PIPELINE[idx + 1];
    };

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order) return;
        setIsUpdating(true);
        try {
            const updated = await orderService.updateOrderStatus(order.id, newStatus);
            setOrder(updated);
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
        });

    const formatCurrency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    // ── Loading ────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#EE6337] opacity-60" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading Order...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────
    if (error || !order) {
        return (
            <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-sm">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
                        <p className="text-xl font-serif font-bold text-[#161B22]">Order Not Found</p>
                        <p className="text-sm text-gray-400">This order may have been removed or is inaccessible.</p>
                        <Button
                            onClick={() => router.push('/orders')}
                            className="bg-[#0A192F] hover:bg-[#162A4B] text-white rounded-xl px-6"
                        >
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const next = nextStatus(order.status);
    const currentPipelineIdx = STATUS_PIPELINE.indexOf(order.status);
    const isCancelled = order.status === OrderStatus.CANCELLED;
    const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.SHIPPING;

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">

            {/* ── Breadcrumbs + Header ─────────────────────────────── */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <button
                        onClick={() => router.push('/orders')}
                        className="hover:text-[#EE6337] transition-colors"
                    >
                        Orders
                    </button>
                    <ChevronRight className="w-3 h-3 text-[#EE6337]" />
                    <span className="text-[#EE6337]">#{String(order.id).padStart(5, '0')}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        {/* Back button */}
                        <button
                            onClick={() => router.push('/orders')}
                            className="mt-1 p-2.5 rounded-xl border border-[#EAE8E3] bg-white shadow-sm hover:bg-[#F4F2EC] hover:border-[#EE6337]/40 transition-all active:scale-95 group"
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-[#EE6337] transition-colors" />
                        </button>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">
                                Order #{String(order.id).padStart(5, '0')}
                            </h1>
                            <div className="flex items-center gap-3">
                                <p className="text-[14px] text-gray-500 font-medium italic flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(order.orderDate)}
                                </p>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content Grid ─────────────────────────────────────── */}
            <div className="px-8 lg:px-12 py-4 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ── Left: Order Items ─────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Items card */}
                    <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                        <div className="px-7 py-5 bg-[#F8F6F2]/80 border-b border-[#EAE8E3]">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-[#EE6337]" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    Order Items ({order.orderItems.length})
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-[#EAE8E3]/50">
                            {order.orderItems.map((item, idx) => (
                                <div key={item.id} className="px-7 py-5 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Index circle */}
                                        <div className="w-8 h-8 bg-[#F4F2EC] rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-[11px] font-bold text-gray-500">{String(idx + 1).padStart(2, '0')}</span>
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-serif font-bold text-[#161B22] line-clamp-1">{item.bookTitle}</p>
                                            <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                                                {formatCurrency(item.price)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[15px] font-bold text-[#161B22] ml-6 shrink-0">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals footer */}
                        <div className="px-7 py-5 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] space-y-2">
                            <div className="flex justify-between text-[13px] text-gray-500 font-medium">
                                <span>Subtotal ({order.orderItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-[13px] text-gray-500 font-medium">
                                <span>Shipping</span>
                                <span className="text-[#2F7E4C] font-bold">Free</span>
                            </div>
                            <div className="h-px bg-[#EAE8E3] my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-[13px] font-bold uppercase tracking-widest text-gray-500">Order Total</span>
                                <span className="text-2xl font-serif font-bold text-[#161B22]">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer card */}
                    <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                        <div className="px-7 py-5 bg-[#F8F6F2]/80 border-b border-[#EAE8E3]">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#EE6337]" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Customer</p>
                            </div>
                        </div>
                        <div className="px-7 py-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F4F2EC] rounded-full flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-[15px] font-serif font-bold text-[#161B22]">User #{order.userId}</p>
                                <p className="text-[12px] text-gray-400 font-medium">Customer ID: {order.userId}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Status & Actions ───────────────────────── */}
                <div className="space-y-4">

                    {/* Status Timeline */}
                    <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 p-7 space-y-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Order Timeline</p>

                        {isCancelled ? (
                            <div className="flex items-center gap-3 p-4 bg-[#FFF4F3] rounded-2xl">
                                <XCircle className="w-5 h-5 text-[#C52A1A]" />
                                <div>
                                    <p className="text-[14px] font-bold text-[#C52A1A]">Order Cancelled</p>
                                    <p className="text-[11px] text-[#C52A1A]/70 font-medium">This order has been cancelled.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {STATUS_PIPELINE.map((s, idx) => {
                                    const done = idx <= currentPipelineIdx;
                                    const active = idx === currentPipelineIdx;
                                    const isLast = idx === STATUS_PIPELINE.length - 1;
                                    const cfg = STATUS_CONFIG[s];
                                    return (
                                        <div key={s} className="flex gap-4">
                                            {/* Line + dot */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${done
                                                    ? active
                                                        ? 'bg-[#0A192F] border-[#0A192F] text-white shadow-md'
                                                        : 'bg-[#0A192F] border-[#0A192F] text-white'
                                                    : 'bg-white border-[#EAE8E3] text-gray-300'
                                                    }`}>
                                                    {PIPELINE_ICONS[s]}
                                                </div>
                                                {!isLast && (
                                                    <div className={`w-0.5 flex-1 my-1 min-h-[24px] rounded-full ${done && idx < currentPipelineIdx ? 'bg-[#0A192F]' : 'bg-[#EAE8E3]'}`} />
                                                )}
                                            </div>
                                            {/* Label */}
                                            <div className={`pb-6 pt-1 ${isLast ? 'pb-0' : ''}`}>
                                                <p className={`text-[14px] font-bold transition-colors ${active ? 'text-[#0A192F]' : done ? 'text-gray-600' : 'text-gray-300'}`}>
                                                    {cfg.label}
                                                </p>
                                                {active && (
                                                    <p className="text-[11px] text-[#EE6337] font-bold mt-0.5">Current status</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {!isCancelled && order.status !== OrderStatus.DELIVERED && (
                        <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 p-7 space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Update Status</p>

                            {next && (
                                <Button
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(next)}
                                    className="w-full h-12 bg-[#0A192F] hover:bg-[#162A4B] text-white rounded-xl font-semibold tracking-wide shadow-md transition-all active:scale-95"
                                >
                                    {isUpdating ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                    ) : (
                                        <>Mark as {STATUS_CONFIG[next].label}</>
                                    )}
                                </Button>
                            )}

                            {canCancel && (
                                <Button
                                    variant="outline"
                                    disabled={isUpdating}
                                    onClick={() => handleStatusChange(OrderStatus.CANCELLED)}
                                    className="w-full h-12 border-[#EAE8E3] text-[#C52A1A] hover:bg-[#FFF4F3] hover:border-[#C52A1A]/30 rounded-xl font-semibold transition-all"
                                >
                                    Cancel Order
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Summary card */}
                    <div className="bg-[#0A192F] rounded-[24px] p-7 text-white space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Order Summary</p>
                        <div className="space-y-3 text-[13px]">
                            <div className="flex justify-between">
                                <span className="opacity-60">Order ID</span>
                                <span className="font-bold font-mono">#{String(order.id).padStart(5, '0')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">Customer</span>
                                <span className="font-bold">User #{order.userId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">Items</span>
                                <span className="font-bold">{order.orderItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-60">Date</span>
                                <span className="font-bold">{new Date(order.orderDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex justify-between text-lg">
                                <span className="opacity-60 text-[12px] font-bold uppercase tracking-widest self-center">Total</span>
                                <span className="font-serif font-bold text-xl">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
