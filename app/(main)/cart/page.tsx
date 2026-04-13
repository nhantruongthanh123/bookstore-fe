'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    ArrowLeft,
    Loader2,
    BookOpen,
    ShoppingBag,
    Tag,
    AlertCircle,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/components/layout/home-header';
import { HomeFooter } from '@/components/layout/home-footer';
import { orderService } from '@/lib/api/services/order.service';

export default function CartPage() {
    const router = useRouter();
    const { isAuthenticated, isInitialized, user } = useAuthStore();
    const { cart, fetchCart, updateQuantity, removeItem, clearCart, isLoading } = useCartStore();
    
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    
    // Checkout states
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);

    useEffect(() => {
        if (!isAuthenticated && isInitialized) { router.push('/login'); return; }
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, isInitialized, fetchCart, router]);

    const handleUpdateQuantity = async (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        setUpdatingId(itemId);
        try { await updateQuantity(itemId, newQty); }
        finally { setUpdatingId(null); }
    };

    const handleRemove = async (itemId: number) => {
        setRemovingId(itemId);
        try { await removeItem(itemId); }
        finally { setRemovingId(null); }
    };

    const handleCheckout = async () => {
        if (!cart || cart.items.length === 0) return;
        
        setIsCheckoutLoading(true);
        try {
            // Map cart items to order items
            const orderItems = cart.items.map(item => ({
                bookId: item.bookId,
                quantity: item.quantity
            }));

            // Create order with placeholder data if user info is missing
            const orderRequest = {
                shippingAddress: user?.address || 'Standard Delivery Address',
                phoneNumber: user?.phoneNumber || '0000000000',
                items: orderItems
            };

            const response = await orderService.createOrder(orderRequest);
            
            // On success
            setOrderId(response.id);
            setCheckoutSuccess(true);
            await clearCart(); // Clear server-side and local state
            
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Failed to complete checkout. Please try again.');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const formatCurrency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    const totalItems = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

    // ── Checkout Success Screen ────────────────────────────────────────────
    if (checkoutSuccess) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] font-sans flex flex-col">
                <HomeHeader />
                <div className="flex-grow flex items-center justify-center py-12">
                    <div className="max-w-md w-full mx-auto px-6 text-center space-y-8">
                        <div className="relative">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 relative z-10">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl animate-pulse"></div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-serif font-bold text-[#161B22]">Order Placed!</h1>
                            <p className="text-gray-500 font-medium">
                                Thank you for your purchase. Your order <span className="text-[#161B22] font-bold">#{orderId}</span> has been successfully created and is now pending.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl border border-[#EAE8E3]/60 p-6 shadow-sm flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order ID</p>
                                <p className="text-[15px] font-bold text-[#161B22]">#{String(orderId).padStart(5, '0')}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                onClick={() => router.push(`/orders/${orderId}`)}
                                className="text-[#EE6337] font-bold text-[13px] hover:bg-[#EE6337]/5"
                            >
                                View Order <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={() => router.push('/books')}
                                className="w-full bg-[#EE6337] hover:bg-[#cd5227] text-white h-14 rounded-2xl font-bold shadow-lg shadow-[#EE6337]/20 active:scale-95 transition-all text-[15px]"
                            >
                                Continue Shopping
                            </Button>
                            <button
                                onClick={() => router.push('/')}
                                className="text-[13px] font-bold text-gray-400 hover:text-[#161B22] transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    // ── Loading ────────────────────────────────────────────────────────────
    if (isLoading && !cart) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] font-sans flex flex-col">
                <HomeHeader />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#EE6337]/60 mx-auto" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading your cart...</p>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    // ── Empty Cart ─────────────────────────────────────────────────────────
    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] font-sans flex flex-col">
                <HomeHeader />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-sm px-4">
                        <div className="w-24 h-24 bg-[#F4F2EC] rounded-full flex items-center justify-center mx-auto">
                            <ShoppingCart className="w-12 h-12 text-gray-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-[#161B22]">Your cart is empty</h1>
                            <p className="text-gray-400 font-medium mt-2">Add some books to get started.</p>
                        </div>
                        <Button
                            onClick={() => router.push('/books')}
                            className="bg-[#EE6337] hover:bg-[#cd5227] text-white px-8 rounded-2xl h-12 font-semibold shadow-lg active:scale-95"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Browse Books
                        </Button>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFA] font-sans flex flex-col">
            <HomeHeader />

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex-grow w-full">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl border border-[#EAE8E3] bg-white shadow-sm hover:bg-[#F4F2EC] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-[#EE6337] transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#161B22]">Shopping Cart</h1>
                        <p className="text-[13px] text-gray-400 font-medium mt-0.5">
                            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ── Cart Items ────────────────────────── */}
                    <div className="lg:col-span-2 space-y-3">
                        {cart.items.map((item) => {
                            const isRemoving = removingId === item.id;
                            const isUpdating = updatingId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-[20px] border border-[#EAE8E3]/50 shadow-sm p-4 flex gap-4 transition-all ${isRemoving ? 'opacity-40 scale-98' : 'hover:shadow-md'}`}
                                >
                                    {/* Cover */}
                                    <Link href={`/books/${item.bookId}`} className="shrink-0">
                                        <div className="relative w-16 h-[88px] md:w-20 md:h-[110px] rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
                                            {item.coverImage ? (
                                                <Image
                                                    src={item.coverImage}
                                                    alt={item.title}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[#F4F2EC] flex items-center justify-center">
                                                    <BookOpen className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <Link href={`/books/${item.bookId}`}>
                                                <h3 className="text-[15px] font-serif font-bold text-[#161B22] line-clamp-2 hover:text-[#EE6337] transition-colors">
                                                    {item.title}
                                                </h3>
                                            </Link>
                                            <p className="text-[13px] text-gray-400 font-medium mt-0.5">
                                                {formatCurrency(item.price)} each
                                            </p>
                                        </div>

                                        {/* Quantity + Remove */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-[#EAE8E3] rounded-xl overflow-hidden bg-[#F8F6F2] shadow-sm">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || isUpdating}
                                                    className="px-3 py-2 text-gray-500 hover:bg-[#EAE8E3] hover:text-[#161B22] transition-colors disabled:opacity-30"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="px-4 py-2 text-[14px] font-bold text-[#161B22] border-x border-[#EAE8E3] min-w-[40px] text-center">
                                                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-[#EE6337]" /> : item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={isUpdating}
                                                    className="px-3 py-2 text-gray-500 hover:bg-[#EAE8E3] hover:text-[#161B22] transition-colors disabled:opacity-30"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={isRemoving}
                                                className="p-2 rounded-lg text-gray-300 hover:text-[#C52A1A] hover:bg-[#FFF4F3] transition-all"
                                            >
                                                {isRemoving
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="shrink-0 text-right flex flex-col justify-between py-1">
                                        <span className="text-[16px] font-bold text-[#161B22]">
                                            {formatCurrency(item.subTotal)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Continue shopping */}
                        <Link
                            href="/books"
                            className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-[#EE6337] transition-colors mt-2"
                        >
                            <Tag className="w-3.5 h-3.5" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* ── Order Summary ─────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[24px] border border-[#EAE8E3]/50 shadow-sm overflow-hidden sticky top-6">
                            {/* Header */}
                            <div className="px-6 py-5 bg-[#F8F6F2]/80 border-b border-[#EAE8E3]">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-[#EE6337]" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order Summary</p>
                                </div>
                            </div>

                            <div className="px-6 py-5 space-y-3">
                                {/* Item lines */}
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between gap-2">
                                        <p className="text-[13px] text-gray-600 font-medium line-clamp-2 flex-1">
                                            {item.title}
                                            <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                        </p>
                                        <span className="text-[13px] font-bold text-[#161B22] shrink-0">
                                            {formatCurrency(item.subTotal)}
                                        </span>
                                    </div>
                                ))}

                                <div className="h-px bg-[#EAE8E3] my-1" />

                                {/* Subtotal */}
                                <div className="flex justify-between text-[13px] text-gray-500 font-medium">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span>{formatCurrency(cart.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-[13px] text-gray-500 font-medium">
                                    <span>Shipping</span>
                                    <span className="text-[#2F7E4C] font-bold">Free</span>
                                </div>

                                <div className="h-px bg-[#EAE8E3] my-1" />

                                {/* Grand total */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-bold uppercase tracking-widest text-gray-500">Total</span>
                                    <span className="text-2xl font-serif font-bold text-[#161B22]">{formatCurrency(cart.totalPrice)}</span>
                                </div>
                            </div>

                            <div className="px-6 pb-6 pt-2 space-y-3">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isCheckoutLoading}
                                    className="w-full h-12 bg-[#EE6337] hover:bg-[#cd5227] text-white rounded-2xl font-bold text-[15px] tracking-wide shadow-lg active:scale-95 transition-all"
                                >
                                    {isCheckoutLoading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Proceed to Checkout
                                        </>
                                    )}
                                </Button>
                                <button
                                    onClick={() => router.push('/books')}
                                    className="w-full text-center text-[12px] font-semibold text-gray-400 hover:text-[#EE6337] transition-colors py-1"
                                >
                                    ← Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <HomeFooter />
        </div>
    );
}
