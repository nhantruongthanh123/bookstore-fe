'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bookService } from '@/lib/api/services/book.service';
import { BookResponse, PageResponse, SearchBookRequest, CategoryResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { HomeFooter } from '@/components/layout/home-footer';
import { HomeHeader } from '@/components/layout/home-header';
import { categoryService } from '@/lib/api/services/category.service';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Search, X, ShoppingCart, SlidersHorizontal, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();

  const [books, setBooks] = useState<BookResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Per-book cart state: 'idle' | 'adding' | 'added'
  const [cartState, setCartState] = useState<Record<number, 'adding' | 'added'>>({});

  const handleAddToCart = async (book: BookResponse) => {
    if (!isAuthenticated) { router.push('/login'); return; }
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

  // Search parameters (authoritative state for fetching)
  const [searchParams, setSearchParams] = useState<SearchBookRequest>({
    title: '',
    author: '',
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  // UI local state for inputs to allow typing before searching
  const [searchInput, setSearchInput] = useState('');
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce effect for text search and prices
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev: SearchBookRequest) => ({
        ...prev,
        title: searchInput,
        minPrice: minPriceInput ? Number(minPriceInput) : undefined,
        maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined,
      }));
      setPage(0);
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [searchInput, minPriceInput, maxPriceInput]);

  // Fetch books — cancelled flag prevents stale updates after unmount (e.g. browser back)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const activeParams = Object.fromEntries(
          Object.entries(searchParams).filter(([_, v]) => v !== '' && v !== undefined)
        );

        let response: PageResponse<BookResponse>;
        if (Object.keys(activeParams).length > 0) {
          response = await bookService.searchBooks(activeParams, page, 12);
        } else {
          response = await bookService.getAllBooks(page, 12);
        }

        if (!cancelled) {
          setBooks(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to fetch books:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [page, searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchParams((prev: SearchBookRequest) => ({
        ...prev,
        title: searchInput,
        category: prev.category,
        minPrice: minPriceInput ? Number(minPriceInput) : undefined,
        maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined,
      }));
      setPage(0);
    }
  };

  const resetFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({
      title: '',
      author: '',
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
    setPage(0);
  };

  if (loading) {
    console.log("loading");
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCFBFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161B22]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] flex flex-col font-sans">
      <HomeHeader />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#161B22] tracking-tight">Our Collection</h1>
            <p className="text-sm text-gray-500 mt-1">Showing {totalElements} books</p>
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden lg:flex items-center gap-3 bg-white p-2 rounded-xl border border-[#EAE8E3] shadow-sm">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 h-10 border-none bg-transparent focus-visible:ring-0 placeholder:text-gray-400 text-sm"
              />
            </div>

            <div className="h-6 w-[1px] bg-gray-200" />

            {/* Category Select cho Desktop */}
            <div className="w-[180px]">
              <Select
                value={searchParams.category || "All categories"}
                onValueChange={(value: string | null) => {
                  const newCategory = (value === null || value === "all") ? undefined : value;
                  setSearchParams(prev => ({ ...prev, category: newCategory }));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 border-none bg-transparent shadow-none focus:ring-0 text-sm text-[#161B22]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-6 w-[1px] bg-gray-200" />

            <div className="flex items-center gap-2 px-3">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Price</span>
              <Input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-16 h-8 text-xs border-[#EAE8E3]"
              />
              <span className="text-gray-300">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-16 h-8 text-xs border-[#EAE8E3]"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 bg-white border-[#EAE8E3] rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-[#EAE8E3] bg-white gap-2 text-[#161B22]"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-[#161B22]">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">

                {/* Category Select cho Mobile */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</label>
                  <Select
                    value={searchParams.category || "all"}
                    onValueChange={(value: string | null) => {
                      // Nếu value là null hoặc "all", ta gán bằng undefined để xóa filter
                      const newCategory = (value === null || value === "all") ? undefined : value;
                      setSearchParams(prev => ({ ...prev, category: newCategory }));
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="w-full h-12 bg-[#F9F8F6] border-[#EAE8E3] text-[#161B22]">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Price Range</label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="Min $"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-12 bg-[#F9F8F6] border-[#EAE8E3]"
                    />
                    <span className="text-gray-300">-</span>
                    <Input
                      type="number"
                      placeholder="Max $"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-12 bg-[#F9F8F6] border-[#EAE8E3]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    className="flex-grow h-12 bg-[#161B22] text-white hover:bg-[#24304f] rounded-xl"
                    onClick={() => setIsMobileFiltersOpen(false)}
                  >
                    Show Results
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 border-[#EAE8E3] rounded-xl"
                    onClick={() => {
                      resetFilters();
                      setIsMobileFiltersOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <div key={book.id} className="group relative">
                <Link href={`/books/${book.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#EAE8E3]/30 border border-[#EAE8E3]/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-[#cd5227]/10 group-hover:-translate-y-1">
                    <Image
                      src={book.coverImage || '/placeholder-book.jpg'}
                      alt={book.title}
                      fill
                      loading="eager"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
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
                </Link>
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <Link href={`/books/${book.id}`} className="hover:text-[#F06A42] transition-colors">
                      <h3 className="font-serif text-lg text-[#161B22] line-clamp-1">{book.title}</h3>
                    </Link>
                    <span className="font-bold text-[#F06A42] pl-3">${book.price}</span>
                  </div>
                  <p className="text-sm text-gray-500">{book.authors?.map(a => a.name).join(', ')}</p>
                  <div className="flex gap-1 pt-1">
                    {book.categories?.slice(0, 2).map(cat => (
                      <span key={cat.id} className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No books found matching your criteria.</p>
            <Button variant="outline" onClick={resetFilters} className="text-[#161B22] border-[#EAE8E3]">
              Clear all filters
            </Button>
          </div>
        )}

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border-[#EAE8E3] text-[#161B22] disabled:opacity-50"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 mx-4">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === i
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
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-lg border-[#EAE8E3] text-[#161B22] disabled:opacity-50"
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