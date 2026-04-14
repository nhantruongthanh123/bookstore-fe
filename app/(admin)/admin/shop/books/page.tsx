'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    ChevronRight,
    Image as ImageIcon,
    AlertCircle,
    ArrowLeft,
    Check
} from 'lucide-react';
import { bookService } from '@/lib/api/services/book.service';
import { categoryService } from '@/lib/api/services/category.service';
import { fileService } from '@/lib/api/services/file.service';
import { authorService } from '@/lib/api/services/author.service';
import { BookResponse, BookRequest, SearchBookRequest, CategoryResponse, AuthorResponse } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const bookSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    authorsIds: z.array(z.number()).min(1, 'Select at least one author'),
    publisher: z.string().optional().or(z.literal('')),
    price: z.number().min(0, 'Price must be positive'),
    isbn: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    coverImage: z.string().optional().or(z.literal('')),
    quantity: z.number().min(0, 'Quantity must be positive'),
    categoryIds: z.array(z.number()).min(1, 'Select at least one category'),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function AdminBooksPage() {
    const router = useRouter();
    // State
    const [books, setBooks] = useState<BookResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [authors, setAuthors] = useState<AuthorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters State
    const [filterTitle, setFilterTitle] = useState('');
    const [filterAuthor, setFilterAuthor] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<BookResponse | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingBook, setDeletingBook] = useState<BookResponse | null>(null);

    // Form
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BookFormData>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: '',
            authorsIds: [],
            publisher: '',
            price: 0,
            isbn: '',
            description: '',
            coverImage: '',
            quantity: 0,
            categoryIds: [],
        }
    });

    const selectedCategoryIds = watch('categoryIds');
    const selectedAuthorsIds = watch('authorsIds');
    const coverImage = watch('coverImage');

    // Load Data
    const fetchBooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const searchParams: SearchBookRequest = {};
            if (filterTitle) searchParams.title = filterTitle;
            if (filterAuthor) searchParams.author = filterAuthor;
            if (filterCategory && filterCategory !== 'all') searchParams.category = filterCategory;

            const response = await bookService.searchBooks(searchParams, page, 10);
            setBooks(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Failed to fetch books', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, filterTitle, filterAuthor, filterCategory]);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchAuthors = async () => {
        try {
            const data = await authorService.getAuthors(0, 100);
            setAuthors(data.content);
        } catch (error) {
            console.error('Failed to fetch authors', error);
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchAuthors();
    }, [fetchBooks]);

    // Handlers
    const handleOpenDialog = (book?: BookResponse) => {
        if (book) {
            setEditingBook(book);
            reset({
                title: book.title,
                authorsIds: book.authors.map((a: AuthorResponse) => a.id),
                publisher: book.publisher || '',
                price: book.price,
                isbn: book.isbn || '',
                description: book.description || '',
                coverImage: book.coverImage || '',
                quantity: book.quantity,
                categoryIds: book.categories.map((c: CategoryResponse) => c.id),
            });
        } else {
            setEditingBook(null);
            reset({
                title: '',
                authorsIds: [],
                publisher: '',
                price: 0,
                isbn: '',
                description: '',
                coverImage: '',
                quantity: 0,
                categoryIds: [],
            });
        }
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (data: BookFormData) => {
        setIsSaving(true);
        try {
            if (editingBook) {
                await bookService.updateBook(editingBook.id, data as BookRequest);
            } else {
                await bookService.createBook(data as BookRequest);
            }
            setIsDialogOpen(false);
            fetchBooks();
        } catch (error) {
            console.error('Failed to save book', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (book: BookResponse) => {
        setDeletingBook(book);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingBook) return;
        try {
            await bookService.deleteBook(deletingBook.id);
            setIsDeleteDialogOpen(false);
            fetchBooks();
        } catch (error) {
            console.error('Failed to delete book', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await fileService.uploadImage(file);
            setValue('coverImage', url);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">

            {/* Header / Breadcrumbs */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Shop Management</span>
                    <ChevronRight className="w-3 h-3 text-[#EE6337]" />
                    <span className="text-[#EE6337]">Books</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">Book Catalog</h1>
                        <p className="text-[14px] text-gray-500 font-medium italic">Maintain and expand the bookstore&apos;s literary collection.</p>
                    </div>

                    <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-6 py-6 rounded-xl shadow-lg transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        <span className="font-semibold tracking-wide">Add New Book</span>
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="px-8 lg:px-12 py-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E3]/50 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#EE6337] transition-colors" />
                        <Input
                            placeholder="Search title, author or ISBN..."
                            value={filterTitle}
                            onChange={(e) => setFilterTitle(e.target.value)}
                            className="pl-10 h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="h-11 px-4 bg-[#F6F5F2] border-transparent rounded-xl text-[14px] font-medium text-gray-600 outline-none hover:bg-[#EBE9E3] transition-colors cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>

                        <Button
                            variant="outline"
                            className="h-11 px-4 border-[#EAE8E3] rounded-xl text-gray-500 hover:text-[#161B22] hover:bg-[#F6F5F2]"
                            onClick={() => {
                                setFilterTitle('');
                                setFilterAuthor('');
                                setFilterCategory('all');
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="px-8 lg:px-12 py-4 flex-1">
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#F8F6F2] hover:bg-[#F8F6F2] border-b border-[#EAE8E3]">
                                <TableHead className="w-[80px] px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Cover</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Book Details</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Categories</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Price</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-center">Stock</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#EE6337] opacity-60" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4">Sequencing Library...</p>
                                    </TableCell>
                                </TableRow>
                            ) : books.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="max-w-xs mx-auto space-y-2">
                                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                                            <p className="text-[17px] font-serif font-bold text-[#161B22]">No books discovered</p>
                                            <p className="text-sm text-gray-400">Try adjusting your filters or add a new literary masterpiece.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                books.map((book) => (
                                    <TableRow
                                        key={book.id}
                                        className={`group hover:bg-[#FAF9F6] border-b border-[#EAE8E3]/40 transition-colors cursor-pointer ${book.isDeleted ? 'opacity-50' : ''}`}
                                        onClick={() => router.push(`/admin/shop/books/${book.id}`)}
                                    >
                                        <TableCell className="px-6 py-5">
                                            <div className="w-12 h-[72px] bg-[#F6F5F2] rounded-md border border-[#EAE8E3]/50 overflow-hidden relative group-hover:shadow-md transition-shadow">
                                                {book.coverImage ? (
                                                    <img
                                                        src={book.coverImage}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-5 h-5 text-gray-300" />
                                                    </div>
                                                )}
                                                {book.isDeleted && (
                                                    <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                                                        <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Deleted</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <div className="space-y-1">
                                                <h4 className="text-[16px] font-serif font-bold text-[#161B22] leading-tight group-hover:text-[#EE6337] transition-colors line-clamp-1">
                                                    {book.title}
                                                </h4>
                                                <p className="text-[13px] text-gray-500 italic font-serif">by {book.authors?.map((a: AuthorResponse) => a.name).join(', ')}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">ISBN: {book.isbn || 'N/A'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {book.categories.map(c => (
                                                    <Badge key={c.id} variant="outline" className="text-[10px] px-2 py-0 bg-transparent border-gray-200 text-gray-500 font-bold uppercase tracking-tight">
                                                        {c.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <span className="text-[15px] font-bold text-[#161B22]">${book.price.toFixed(2)}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-5 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`text-[13px] font-bold ${book.quantity < 10 ? 'text-red-500' : 'text-[#2F7E4C]'}`}>
                                                    {book.quantity}
                                                </span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Units</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 text-gray-400 hover:text-[#EE6337] hover:bg-[#EE6337]/10 rounded-lg transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/shop/books/${book.id}`);
                                                    }}
                                                    disabled={book.isDeleted}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`w-9 h-9 ${book.isDeleted ? 'text-gray-300 rotate-45' : 'text-gray-400 hover:text-[#C52A1A] hover:bg-[#C52A1A]/10'} rounded-lg transition-all`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(book);
                                                    }}
                                                    disabled={book.isDeleted}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="px-8 py-6 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] flex items-center justify-between">
                            <p className="text-[12px] font-medium text-gray-400">
                                Showing page <span className="text-[#161B22] font-bold">{page + 1}</span> of <span className="text-[#161B22] font-bold">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="border-[#EAE8E3] rounded-lg text-xs"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="border-[#EAE8E3] rounded-lg text-xs"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-[24px] p-0 border-none shadow-2xl font-sans">
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <DialogHeader className="px-8 pt-8 pb-6 border-b border-[#EAE8E3]/50 bg-[#F8F6F2]/80 rounded-t-[24px]">
                            <DialogTitle className="text-2xl font-serif font-bold text-[#161B22]">
                                {editingBook ? 'Refine Book Details' : 'Introduce New Collection'}
                            </DialogTitle>
                            <DialogDescription className="text-[13px] text-gray-500 font-medium">
                                Fill in the details to {editingBook ? 'update the existing entry' : 'add a new book to the catalog'}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Image Placeholder/Upload */}
                            <div className="md:col-span-2 flex flex-col items-center justify-center p-8 bg-[#F6F5F2] rounded-2xl border-2 border-dashed border-[#EAE8E3] group relative overflow-hidden transition-all hover:border-[#EE6337]/50">
                                {coverImage ? (
                                    <div className="relative w-32 h-48 shadow-xl rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                        <div
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                            onClick={() => document.getElementById('cover-upload')?.click()}
                                        >
                                            <Plus className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center gap-3 cursor-pointer"
                                        onClick={() => document.getElementById('cover-upload')?.click()}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#EE6337] transition-colors">
                                            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[13px] font-bold text-[#161B22]">Upload Cover Image</p>
                                            <p className="text-[11px] text-gray-400 font-medium tracking-tight">JPG, PNG or WEBP (Max 5MB)</p>
                                        </div>
                                    </div>
                                )}
                                <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <input type="hidden" {...register('coverImage')} />
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Book Title</Label>
                                <Input
                                    {...register('title')}
                                    placeholder="e.g. The Great Gatsby"
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                                />
                                {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message}</p>}
                            </div>

                            {/* Authors */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Authors</Label>
                                <div className="grid grid-cols-2 gap-2 p-3 bg-[#F6F5F2] rounded-xl border border-[#EAE8E3]/50 max-h-[140px] overflow-y-auto">
                                    {authors.map((authorItem) => (
                                        <div key={authorItem.id} className="flex items-center space-x-2 group cursor-pointer"
                                            onClick={() => {
                                                const current = selectedAuthorsIds || [];
                                                const updated = current.includes(authorItem.id)
                                                    ? current.filter(id => id !== authorItem.id)
                                                    : [...current, authorItem.id];
                                                setValue('authorsIds', updated);
                                            }}
                                        >
                                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${selectedAuthorsIds?.includes(authorItem.id)
                                                ? 'bg-[#161B22] border-[#161B22]'
                                                : 'border-gray-300 group-hover:border-[#EE6337]'
                                                }`}>
                                                {selectedAuthorsIds?.includes(authorItem.id) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="text-[12px] font-medium text-gray-600 group-hover:text-[#161B22] transition-colors truncate">{authorItem.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {errors.authorsIds && <p className="text-[10px] text-red-500 font-bold">{errors.authorsIds.message}</p>}
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Label Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { valueAsNumber: true })}
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                                />
                                {errors.price && <p className="text-[10px] text-red-500 font-bold">{errors.price.message}</p>}
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Initial Stock</Label>
                                <Input
                                    type="number"
                                    {...register('quantity', { valueAsNumber: true })}
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                                />
                                {errors.quantity && <p className="text-[10px] text-red-500 font-bold">{errors.quantity.message}</p>}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Description</Label>
                                <Textarea
                                    {...register('description')}
                                    rows={3}
                                    placeholder="Summarize the core theme or plot..."
                                    className="bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Categories Selection */}
                            <div className="md:col-span-2 space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Genres / Categories</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F6F5F2] rounded-2xl border border-[#EAE8E3]/50">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center space-x-2 group cursor-pointer"
                                            onClick={() => {
                                                const current = selectedCategoryIds || [];
                                                const updated = current.includes(category.id)
                                                    ? current.filter(id => id !== category.id)
                                                    : [...current, category.id];
                                                setValue('categoryIds', updated);
                                            }}
                                        >
                                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${selectedCategoryIds?.includes(category.id)
                                                ? 'bg-[#161B22] border-[#161B22]'
                                                : 'border-gray-300 group-hover:border-[#EE6337]'
                                                }`}>
                                                {selectedCategoryIds?.includes(category.id) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="text-[13px] font-medium text-gray-600 group-hover:text-[#161B22] transition-colors">{category.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {errors.categoryIds && <p className="text-[10px] text-red-500 font-bold">{errors.categoryIds.message}</p>}
                            </div>
                        </div>

                        <DialogFooter className="px-8 py-6 bg-[#F8F6F2] border-t border-[#EAE8E3]/50 rounded-b-[24px]">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="text-gray-500 font-semibold hover:text-[#161B22]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-8 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : editingBook ? 'Save Changes' : 'Finalize Entry'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-white rounded-[24px] p-8 border-none shadow-2xl font-sans text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-8 h-8 text-[#C52A1A]" />
                    </div>
                    <DialogTitle className="text-2xl font-serif font-bold text-[#161B22] mb-2">Delete Work?</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
                        Are you sure you want to remove <span className="text-[#161B22] font-bold">"{deletingBook?.title}"</span>?
                        This book will be archived and marked as deleted in the catalog.
                    </DialogDescription>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button
                            variant="destructive"
                            className="w-full bg-[#C52A1A] hover:bg-[#A52316] rounded-xl h-12 font-bold tracking-wide shadow-lg active:scale-95"
                            onClick={confirmDelete}
                        >
                            Delete Book
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-gray-400 font-bold hover:text-gray-600"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Keep in Catalog
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
