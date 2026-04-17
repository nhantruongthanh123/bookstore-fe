"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Star, TrendingUp, ChevronRight, Image as ImageIcon, Loader2, ShoppingCart, CheckCircle2 } from "lucide-react";
import { HomeHeader } from "@/components/layout/home-header";
import { HomeFooter } from "@/components/layout/home-footer";
import { bookService } from "@/lib/api/services/book.service";
import { authorService } from "@/lib/api/services/author.service";
import { categoryService } from "@/lib/api/services/category.service";
import { BookResponse, AuthorResponse, CategoryResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";

const bgColors = [
  "bg-gradient-to-br from-[#06152f] to-[#122b54]",
  "bg-gradient-to-br from-[#812f18] to-[#bd380d]",
  "bg-gradient-to-br from-[#1c362a] to-[#2f7e4c]",
  "bg-gradient-to-br from-[#4b274e] to-[#7f3982]",
  "bg-gradient-to-br from-[#121c27] to-[#24304f]",
  "bg-gradient-to-br from-[#5c3e1e] to-[#cd5227]",
  "bg-gradient-to-br from-[#162744] to-[#266ea8]",
  "bg-gradient-to-br from-[#541e26] to-[#b12f45]",
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();

  const [newBooks, setNewBooks] = useState<BookResponse[]>([]);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cartState, setCartState] = useState<Record<number, 'adding' | 'added'>>({});

  const handleAddToCart = async (book: BookResponse) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (cartState[book.id]) return; // already in-flight
    setCartState((prev) => ({ ...prev, [book.id]: 'adding' }));
    try {
      await addToCart({ bookId: book.id, quantity: 1 });
      setCartState((prev) => ({ ...prev, [book.id]: 'added' }));
      setTimeout(() => {
        setCartState((prev) => { const next = { ...prev }; delete next[book.id]; return next; });
      }, 2000);
    } catch {
      setCartState((prev) => { const next = { ...prev }; delete next[book.id]; return next; });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [booksData, authorsData, categoriesData] = await Promise.all([
          bookService.getAllBooks(0, 5, "id,desc"),
          authorService.getAuthors(0, 4),
          categoryService.getAllCategories(),
        ]);
        setNewBooks(booksData.content || []);
        setAuthors(authorsData.content || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#efefec] text-[#1f2333] font-sans">
      <main className="min-h-screen w-full border-y-4 border-[#EE6337] bg-[#FCFBFA] shadow-[0_22px_50px_rgba(17,24,39,0.12)] md:border-4">
        <HomeHeader />

        {/* Hero Section */}
        <section className="p-4 md:p-8">
          <div className="relative isolate overflow-hidden rounded-2xl shadow-[0_30px_45px_rgba(7,10,22,0.15)]">
            <Image
              src="/hero-banner.svg"
              alt="A cozy private library with warm lighting"
              width={1600}
              height={900}
              priority
              className="h-[440px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06152f]/95 via-[#0f2446]/70 to-transparent" />

            <div className="absolute left-0 top-0 flex h-full w-full max-w-xl flex-col justify-center p-8 md:p-12 text-[#f4efe8]">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#EE6337]">
                Curated Experiences
              </p>
              <h1 className="max-w-md text-4xl leading-[1.1] font-serif font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                The Digital Private Library.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-[#d7dbdf] md:text-base font-medium">
                Step away from the algorithm. Discover a hand-selected
                collection of timeless literature and contemporary
                masterpieces.
              </p>
              <Link
                href="/books"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-[#EE6337] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#D5522B] shadow-lg hover:shadow-xl active:scale-95"
              >
                Discover Your Next Favorite Book
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-[#EE6337]" />
            <p className="mt-6 text-[13px] font-bold uppercase tracking-widest text-gray-400">Curating the library...</p>
          </div>
        ) : (
          <>
            {/* New Arrivals (Horizontal Carousel) */}
            {newBooks.length > 0 && (
              <section className="px-4 py-8 md:px-8 md:py-12 max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#161B22] flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-[#EE6337]" />
                      New Arrivals
                    </h2>
                    <p className="text-gray-500 font-medium italic mt-2">Fresh off the press into our catalog.</p>
                  </div>
                  <Link href="/books" className="text-[13px] font-bold uppercase tracking-widest text-[#EE6337] hover:text-[#D5522B] flex items-center gap-1 group transition-colors">
                    Filter All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="flex overflow-x-auto snap-x hide-scrollbar gap-6 pb-12 -mx-4 px-4 md:mx-0 md:px-0">
                  {newBooks.map((book) => (
                    <Link key={book.id} href={`/books/${book.id}`} className="snap-start shrink-0 w-[260px] group">
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EAE8E3]/50 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:border-[#EE6337]/30 transition-all h-full flex flex-col">
                        <div className="w-full h-[320px] bg-[#F6F5F2] rounded-xl mb-5 overflow-hidden relative shadow-inner">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#161B22] text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                            NEW
                          </div>

                          {/* Hover Add to Cart Overlay */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                            <Button
                              variant="outline"
                              onClick={(e) => { e.preventDefault(); handleAddToCart(book); }}
                              disabled={!!cartState[book.id]}
                              className={`w-full border-none shadow-lg gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${cartState[book.id] === 'added'
                                ? 'bg-[#2F7E4C] hover:bg-[#2F7E4C] text-white'
                                : 'bg-white/95 hover:bg-white text-[#161B22]'
                                }`}
                            >
                              {cartState[book.id] === 'adding' && <Loader2 className="h-4 w-4 animate-spin" />}
                              {cartState[book.id] === 'added' && <CheckCircle2 className="h-4 w-4" />}
                              {!cartState[book.id] && <ShoppingCart className="h-4 w-4" />}
                              {cartState[book.id] === 'adding' ? 'Adding...' : cartState[book.id] === 'added' ? 'Added!' : 'Add to Cart'}
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col flex-1">
                          <h3 className="font-serif font-bold text-[18px] leading-snug text-[#161B22] group-hover:text-[#EE6337] transition-colors line-clamp-2 mb-1.5">
                            {book.title}
                          </h3>
                          <p className="text-[14px] text-gray-400 italic font-serif mb-4 line-clamp-1">
                            {book.authors?.map(a => a.name).join(', ')}
                          </p>
                          <div className="mt-auto pt-4 border-t border-[#EAE8E3]/50 flex items-center justify-between">
                            <span className="font-bold text-[18px] text-[#24304f]">${book.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Curated Authors */}
            {authors.length > 0 && (
              <section className="px-4 py-8 md:p-12 bg-[#F4F2EC] rounded-[40px] mx-4 md:mx-8 mb-16 shadow-inner max-w-[1600px] xl:mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#161B22] flex items-center justify-center gap-3">
                    <Star className="w-8 h-8 text-[#EE6337]" />
                    Featured Authors
                  </h2>
                  <p className="text-gray-500 font-medium italic mt-3">Discover words crafted by the most esteemed minds of our curation.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto">
                  {authors.map((author) => (
                    <Link key={author.id} href={`/books?search=${encodeURIComponent(author.name)}`} className="group flex flex-col items-center">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-sm border-[6px] border-white group-hover:border-[#EE6337]/20 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group-hover:-translate-y-2 relative">
                        <span className="text-5xl font-serif font-bold text-gray-200 group-hover:text-[#EE6337]/40 transition-colors absolute">
                          {author.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="mt-6 font-serif font-bold text-[18px] text-[#161B22] text-center group-hover:text-[#EE6337] transition-colors">{author.name}</h3>
                      <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mt-1 text-center">View Works</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Browse by Genre */}
            {categories.length > 0 && (
              <section className="px-4 py-8 md:px-8 pb-20 max-w-[1600px] mx-auto">
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#161B22] flex items-center justify-center md:justify-start gap-3">
                    <BookOpen className="w-8 h-8 text-[#EE6337]" />
                    Browse by Genre
                  </h2>
                  <p className="text-gray-500 font-medium italic mt-2">Explore our sprawling selection of literary subjects.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {categories.map((category, index) => (
                    <div key={category.id} className="group relative h-48 md:h-56 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1.5 cursor-pointer">
                      <div className={`absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 ${bgColors[index % bgColors.length]}`} />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                      {/* Decorative Element */}
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />

                      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-md group-hover:scale-105 origin-bottom-left transition-transform duration-500">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-white/80 text-sm mt-3 line-clamp-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 font-medium">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <HomeFooter />
      </main>
    </div>
  );
}
