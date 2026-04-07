'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookService } from '@/lib/api/services/book.service';
import { BookResponse, PageResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { HomeFooter } from '@/components/layout/home-footer';
import { HomeHeader } from '@/components/layout/home-header';

export default function BooksPage() {
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response: PageResponse<BookResponse> = await bookService.getAllBooks(page, 12);
      setBooks(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }

    setLoading(true);
    try {
      const response = await bookService.searchBooks({ title: searchQuery }, 0, 12);
      setBooks(response.content);
      setTotalPages(response.totalPages);
      setPage(0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Books</h1>

      {/* Search */}
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search books by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={book.coverImage || '/placeholder-book.jpg'}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{book.title}</CardTitle>
              <CardDescription>{book.author}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${book.price}</p>
              <p className="text-sm text-gray-600 mt-2">
                Stock: {book.quantity > 0 ? book.quantity : 'Out of stock'}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/books/${book.id}`} className="w-full">
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
}
