'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    ChevronRight,
    Loader2,
    AlertCircle,
    Clock,
    PackageCheck,
    Truck,
    XCircle,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { orderService } from '@/lib/api/services/order.service';
import { OrderResponse, OrderStatus } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Status Config (4 statuses) ───────────────────────────────────────────────
export const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }
> = {
    [OrderStatus.PENDING]: {
        label: 'Pending',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        dot: 'bg-amber-500',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    [OrderStatus.SHIPPING]: {
        label: 'Shipping',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        dot: 'bg-blue-500',
        icon: <Truck className="w-3.5 h-3.5" />,
    },
    [OrderStatus.DELIVERED]: {
        label: 'Delivered',
        color: 'text-[#2F7E4C]',
        bg: 'bg-[#F0FBF4]',
        dot: 'bg-[#2F7E4C]',
        icon: <PackageCheck className="w-3.5 h-3.5" />,
    },
    [OrderStatus.CANCELLED]: {
        label: 'Cancelled',
        color: 'text-[#C52A1A]',
        bg: 'bg-[#FFF4F3]',
        dot: 'bg-[#C52A1A]',
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [filterQuery, setFilterQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        let cancelled = false;
        setIsLoading(true);
        try {
            const data = await orderService.getAllOrders(page, 10);
            if (!cancelled) {
                setOrders(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            }
        } catch (err) {
            if (!cancelled) console.error('Failed to fetch orders', err);
        } finally {
            if (!cancelled) setIsLoading(false);
        }
        return () => { cancelled = true; };
    }, [page]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // ── Client-side filter within current page ─────────────────────────────
    const filtered = orders.filter((o) => {
        const q = filterQuery.toLowerCase();
        const matchQuery =
            !q ||
            String(o.id).includes(q) ||
            String(o.userId).includes(q);
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchQuery && matchStatus;
    });

    // ── Stats ──────────────────────────────────────────────────────────────
    const statCounts = {
        pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
        shipping: orders.filter((o) => o.status === OrderStatus.SHIPPING).length,
        delivered: orders.filter((o) => o.status === OrderStatus.DELIVERED).length,
        cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    const formatCurrency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">

            {/* ── Breadcrumbs + Header ─────────────────────────────── */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#EE6337]">Orders</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">
                            Order Management
                        </h1>
                        <p className="text-[14px] text-gray-500 font-medium italic">
                            Track, fulfil, and manage every customer transaction.
                        </p>
                    </div>
                    <p className="text-[13px] font-bold text-gray-400">
                        <span className="text-[#161B22]">{totalElements}</span> total orders
                    </p>
                </div>
            </div>

            {/* ── Stats Bar ────────────────────────────────────────── */}
            <div className="px-8 lg:px-12 py-2">
                <div className="flex flex-wrap gap-3">
                    {[
                        { key: 'pending' as const, label: 'Pending', status: OrderStatus.PENDING, icon: <Clock className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50' },
                        { key: 'shipping' as const, label: 'Shipping', status: OrderStatus.SHIPPING, icon: <Truck className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50' },
                        { key: 'delivered' as const, label: 'Delivered', status: OrderStatus.DELIVERED, icon: <PackageCheck className="w-4 h-4 text-[#2F7E4C]" />, bg: 'bg-[#F0FBF4]' },
                        { key: 'cancelled' as const, label: 'Cancelled', status: OrderStatus.CANCELLED, icon: <XCircle className="w-4 h-4 text-[#C52A1A]" />, bg: 'bg-[#FFF4F3]' },
                    ].map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setFilterStatus(filterStatus === s.status ? 'all' : s.status)}
                            className={`bg-white border rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-sm transition-all hover:shadow-md active:scale-95 ${filterStatus === s.status
                                ? 'border-[#EE6337] ring-1 ring-[#EE6337]/30'
                                : 'border-[#EAE8E3]/50'
                                }`}
                        >
                            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                                {s.icon}
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                                <p className="text-xl font-serif font-bold text-[#161B22]">{statCounts[s.key]}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Filter Bar ───────────────────────────────────────── */}
            <div className="px-8 lg:px-12 py-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E3]/50 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[220px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#EE6337] transition-colors" />
                        <Input
                            placeholder="Search by order ID or user ID..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="pl-10 h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                        className="h-11 px-4 bg-[#F6F5F2] border-transparent rounded-xl text-[14px] font-medium text-gray-600 outline-none hover:bg-[#EBE9E3] transition-colors cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        {Object.values(OrderStatus).map((s) => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                    </select>
                    <Button
                        variant="outline"
                        className="h-11 px-4 border-[#EAE8E3] rounded-xl text-gray-500 hover:text-[#161B22] hover:bg-[#F6F5F2]"
                        onClick={() => { setFilterQuery(''); setFilterStatus('all'); }}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* ── Table ────────────────────────────────────────────── */}
            <div className="px-8 lg:px-12 py-4 flex-1">
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#F8F6F2] hover:bg-[#F8F6F2] border-b border-[#EAE8E3]">
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 w-28">Order ID</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Customer</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Date</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Total</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-center">Items</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-center">Status</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#EE6337] opacity-60" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4">Loading Orders...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="max-w-xs mx-auto space-y-2">
                                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                                            <p className="text-[17px] font-serif font-bold text-[#161B22]">No orders found</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search or status filter.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="group hover:bg-[#FAF9F6] border-b border-[#EAE8E3]/40 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/orders/${order.id}`)}
                                    >
                                        {/* Order ID */}
                                        <TableCell className="px-6 py-4">
                                            <span className="text-[13px] font-bold text-[#161B22] font-mono">
                                                #{String(order.id).padStart(5, '0')}
                                            </span>
                                        </TableCell>

                                        {/* Customer */}
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-[#F4F2EC] rounded-full flex items-center justify-center shrink-0">
                                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                                </div>
                                                <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#161B22]">
                                                    User #{order.userId}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="px-6 py-4">
                                            <span className="text-[13px] text-gray-500 font-medium">
                                                {formatDate(order.orderDate)}
                                            </span>
                                        </TableCell>

                                        {/* Total */}
                                        <TableCell className="px-6 py-4">
                                            <span className="text-[15px] font-bold text-[#161B22]">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </TableCell>

                                        {/* Items count */}
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 bg-[#F4F2EC] rounded-full text-[12px] font-bold text-[#161B22]">
                                                {order.orderItems.length}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="px-6 py-4 text-center">
                                            <StatusBadge status={order.status} />
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-3 text-[11px] font-bold text-gray-400 hover:text-[#EE6337] hover:bg-[#EE6337]/10 rounded-lg"
                                                onClick={() => router.push(`/orders/${order.id}`)}
                                            >
                                                View →
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="px-8 py-5 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] flex items-center justify-between">
                            <p className="text-[12px] font-medium text-gray-400">
                                Page <span className="text-[#161B22] font-bold">{page + 1}</span> of <span className="text-[#161B22] font-bold">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={page === 0}
                                    onClick={() => setPage((p) => p - 1)} className="border-[#EAE8E3] rounded-lg text-xs">
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages - 1}
                                    onClick={() => setPage((p) => p + 1)} className="border-[#EAE8E3] rounded-lg text-xs">
                                    Next <ChevronRightIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
