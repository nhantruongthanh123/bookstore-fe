'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    ShoppingCart,
    Tag,
    BookOpen,
    Building2,
    Hash,
    Minus,
    Plus,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Package,
} from 'lucide-react';
import { bookService } from '@/lib/api/services/book.service';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { BookResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { HomeHeader } from '@/components/layout/home-header';
import { HomeFooter } from '@/components/layout/home-footer';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = Number(params.id);

    const { isAuthenticated } = useAuthStore();
    const { addToCart } = useCartStore();

    const [book, setBook] = useState<BookResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedFeedback, setAddedFeedback] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        bookService.getBookById(bookId)
            .then((data) => { if (!cancelled) { setBook(data); setIsLoading(false); } })
            .catch(() => { if (!cancelled) { setError(true); setIsLoading(false); } });
        return () => { cancelled = true; };
    }, [bookId]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (!book) return;
        setAddingToCart(true);
        try {
            await addToCart({ bookId: book.id, quantity });
            setAddedFeedback(true);
            setTimeout(() => setAddedFeedback(false), 2500);
        } catch {
            // toast error could go here
        } finally {
            setAddingToCart(false);
        }
    };

    const formatCurrency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
                <HomeHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#EE6337]/60 mx-auto" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading book...</p>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
                <HomeHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-sm">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
                        <p className="text-xl font-serif font-bold text-[#161B22]">Book Not Found</p>
                        <Button onClick={() => router.push('/books')}
                            className="bg-[#0A192F] hover:bg-[#162A4B] text-white rounded-xl px-6">
                            Browse Books
                        </Button>
                    </div>
                </div>
                <HomeFooter />
            </div>
        );
    }

    const inStock = book.quantity > 0 && !book.isDeleted;

    return (
        <div className="min-h-screen bg-[#FDFCFA] flex flex-col font-sans">
            <HomeHeader />
            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium mb-8">
                        <Link href="/" className="hover:text-[#EE6337] transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/books" className="hover:text-[#EE6337] transition-colors">Books</Link>
                        <span>/</span>
                        <span className="text-[#161B22] font-semibold line-clamp-1">{book.title}</span>
                    </div>

                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-[#EE6337] transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    {/* Main layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                        {/* Cover Image */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative w-[280px] h-[400px] md:w-[320px] md:h-[460px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
                                {book.coverImage ? (
                                    <Image
                                        src={book.coverImage}
                                        alt={book.title}
                                        fill
                                        sizes="(max-width: 768px) 280px, 320px"
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#F4F2EC] flex flex-col items-center justify-center gap-3">
                                        <BookOpen className="w-16 h-16 text-gray-300" />
                                        <p className="text-[12px] text-gray-300 font-bold uppercase tracking-widest">No Cover</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-center space-y-6">

                            {/* Categories */}
                            {book.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {book.categories.map((cat) => (
                                        <span key={cat.id}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF4EC] text-[#EE6337] border border-[#EE6337]/20">
                                            <Tag className="w-3 h-3" />
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#161B22] leading-tight">
                                    {book.title}
                                </h1>
                                <p className="text-[15px] text-gray-500 font-medium mt-2">
                                    by <span className="text-[#161B22] font-semibold">{book.author}</span>
                                </p>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-serif font-bold text-[#161B22]">
                                    {formatCurrency(book.price)}
                                </span>
                                <span className={`text-[12px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${inStock ? 'bg-[#F0FBF4] text-[#2F7E4C]' : 'bg-[#FFF4F3] text-[#C52A1A]'}`}>
                                    {inStock ? `In Stock (${book.quantity})` : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Meta info */}
                            <div className="grid grid-cols-2 gap-3">
                                {book.publisher && (
                                    <div className="bg-[#F8F6F2] rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Building2 className="w-3.5 h-3.5 text-[#EE6337]" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Publisher</p>
                                        </div>
                                        <p className="text-[13px] font-semibold text-[#161B22]">{book.publisher}</p>
                                    </div>
                                )}
                                {book.isbn && (
                                    <div className="bg-[#F8F6F2] rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Hash className="w-3.5 h-3.5 text-[#EE6337]" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ISBN</p>
                                        </div>
                                        <p className="text-[13px] font-semibold text-[#161B22] font-mono">{book.isbn}</p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {book.description && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">About This Book</p>
                                    <p className="text-[14px] text-gray-600 leading-relaxed">{book.description}</p>
                                </div>
                            )}

                            {/* Quantity + Add to Cart */}
                            {inStock && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Quantity</p>
                                        <div className="flex items-center border border-[#EAE8E3] rounded-xl overflow-hidden bg-white shadow-sm">
                                            <button
                                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                className="px-4 py-2.5 text-gray-500 hover:bg-[#F4F2EC] hover:text-[#161B22] transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="px-5 py-2.5 text-[15px] font-bold text-[#161B22] border-x border-[#EAE8E3] min-w-[48px] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity((q) => Math.min(book.quantity, q + 1))}
                                                className="px-4 py-2.5 text-gray-500 hover:bg-[#F4F2EC] hover:text-[#161B22] transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart || addedFeedback}
                                        className={`w-full h-14 rounded-2xl text-[15px] font-bold tracking-wide shadow-lg transition-all active:scale-95 ${addedFeedback
                                            ? 'bg-[#2F7E4C] hover:bg-[#2F7E4C] text-white'
                                            : 'bg-[#EE6337] hover:bg-[#cd5227] text-white'
                                            }`}
                                    >
                                        {addingToCart ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Adding to Cart...</>
                                        ) : addedFeedback ? (
                                            <><CheckCircle2 className="w-5 h-5 mr-2" />Added to Cart!</>
                                        ) : (
                                            <><ShoppingCart className="w-5 h-5 mr-2" />Add to Cart — {formatCurrency(book.price * quantity)}</>
                                        )}
                                    </Button>

                                    <button
                                        onClick={() => router.push('/cart')}
                                        className="w-full text-center text-[13px] font-semibold text-gray-400 hover:text-[#EE6337] transition-colors"
                                    >
                                        View Cart →
                                    </button>
                                </div>
                            )}

                            {!inStock && (
                                <div className="flex items-center gap-3 p-4 bg-[#FFF4F3] rounded-2xl">
                                    <Package className="w-5 h-5 text-[#C52A1A]" />
                                    <div>
                                        <p className="text-[14px] font-bold text-[#C52A1A]">Currently Unavailable</p>
                                        <p className="text-[12px] text-[#C52A1A]/70 font-medium">This book is out of stock.</p>
                                    </div>
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
