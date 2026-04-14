'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Loader2,
    ChevronRight,
    ArrowLeft,
    Save,
    Trash2,
    Plus,
    Check,
    Image as ImageIcon,
    AlertCircle
} from 'lucide-react';
import { bookService } from '@/lib/api/services/book.service';
import { categoryService } from '@/lib/api/services/category.service';
import { fileService } from '@/lib/api/services/file.service';
import { BookResponse, BookRequest, CategoryResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const bookSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    publisher: z.string().optional().or(z.literal('')),
    price: z.number().min(0, 'Price must be positive'),
    isbn: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    coverImage: z.string().optional().or(z.literal('')),
    quantity: z.number().min(0, 'Quantity must be positive'),
    categoryIds: z.array(z.number()).min(1, 'Select at least one category'),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = Number(params.id);

    const [book, setBook] = useState<BookResponse | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm<BookFormData>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: '',
            author: '',
            publisher: '',
            price: 0,
            isbn: '',
            description: '',
            coverImage: '',
            quantity: 0,
            categoryIds: [],
        }
    });

    const selectedCategoryIds = watch('categoryIds') || [];
    const coverImage = watch('coverImage');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [bookData, categoriesData] = await Promise.all([
                bookService.getBookById(bookId),
                categoryService.getAllCategories()
            ]);

            setBook(bookData);
            setCategories(categoriesData);

            reset({
                title: bookData.title,
                author: bookData.author,
                publisher: bookData.publisher || '',
                price: bookData.price,
                isbn: bookData.isbn || '',
                description: bookData.description || '',
                coverImage: bookData.coverImage || '',
                quantity: bookData.quantity,
                categoryIds: bookData.categories.map(c => c.id),
            });
        } catch (error) {
            console.error('Failed to fetch book details', error);
        } finally {
            setIsLoading(false);
        }
    }, [bookId, reset]);

    useEffect(() => {
        if (!isNaN(bookId)) {
            fetchData();
        }
    }, [bookId, fetchData]);

    const handleFormSubmit = async (data: BookFormData) => {
        setIsSaving(true);
        try {
            await bookService.updateBook(bookId, data as BookRequest);
            // Re-fetch to synchronize state
            await fetchData();
        } catch (error) {
            console.error('Failed to update book', error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await bookService.deleteBook(bookId);
            setIsDeleteDialogOpen(false);
            router.push('/admin/shop/books'); // Back to list
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
            setValue('coverImage', url, { shouldDirty: true });
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FCFBFA]">
                <Loader2 className="w-12 h-12 text-[#EE6337] animate-spin mx-auto opacity-70" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mt-4">Loading Details...</p>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FCFBFA]">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto opacity-70" />
                <p className="text-[15px] font-bold text-gray-500 mt-4">Book not found or could not be loaded.</p>
                <Button onClick={() => router.push('/admin/shop/books')} className="mt-6">Back to Catalog</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans pb-12">

            {/* Breadcrumbs & Header */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span className="cursor-pointer hover:text-gray-600 transition-colors" onClick={() => router.push('/admin')}>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="cursor-pointer hover:text-gray-600 transition-colors" onClick={() => router.push('/admin/shop/books')}>Shop Management</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="cursor-pointer hover:text-gray-600 transition-colors" onClick={() => router.push('/admin/shop/books')}>Books</span>
                    <ChevronRight className="w-3 h-3 text-[#EE6337]" />
                    <span className="text-[#EE6337] truncate max-w-[200px] inline-block align-bottom">{book.title}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-[#161B22]"
                                onClick={() => router.push('/admin/shop/books')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#161B22] tracking-tight truncate max-w-[600px]">{book.title}</h1>
                            {book.isDeleted && (
                                <Badge variant="destructive" className="ml-2 uppercase text-[10px] bg-red-100 text-red-600 hover:bg-red-200 border-none">Deleted</Badge>
                            )}
                        </div>
                        <p className="text-[14px] text-gray-500 font-medium italic pl-11">Review and modify the details for this publication.</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="text-[#C52A1A] border-[#C52A1A]/30 hover:bg-[#C52A1A]/10 px-6 rounded-xl font-bold tracking-wide transition-all min-h-[44px]"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={book.isDeleted}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                        <Button
                            className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-8 rounded-xl font-bold tracking-wide shadow-lg transition-all active:scale-95 min-h-[44px]"
                            onClick={handleSubmit(handleFormSubmit)}
                            disabled={isSaving || (!isDirty && !isUploading)}
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 lg:px-12 py-4">
                <form className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={handleSubmit(handleFormSubmit)}>

                    {/* Left Column: Image & Stats */}
                    <div className="space-y-6">
                        {/* Cover Image Upload Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE8E3]/50 flex flex-col items-center group relative">
                            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#EE6337] w-full text-left mb-6">Cover Presentation</h3>

                            <div className="relative w-48 h-72 shadow-xl rounded-lg overflow-hidden border border-[#EAE8E3]/50 transition-all group-hover:shadow-2xl">
                                {coverImage ? (
                                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#F6F5F2] flex flex-col items-center justify-center space-y-2">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                        <span className="text-[10px] uppercase font-bold text-gray-400">No Image</span>
                                    </div>
                                )}
                                <div
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                                    onClick={() => document.getElementById('cover-upload-page')?.click()}
                                >
                                    <div className="bg-white/90 p-3 rounded-full shadow-lg">
                                        <Plus className="w-6 h-6 text-[#161B22]" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium tracking-tight mt-6 text-center">Click to replace. Supported formats: JPG, PNG, WEBP. Recommended size: 800x1200.</p>

                            <input id="cover-upload-page" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <input type="hidden" {...register('coverImage')} />
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-[#F8F6F2] p-6 rounded-2xl border border-[#EAE8E3] space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E3]">
                                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Book ID</span>
                                <span className="text-[14px] font-bold text-[#161B22] border px-2 py-0.5 rounded-md border-gray-300 bg-white">#{String(book.id).padStart(5, '0')}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E3]">
                                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Status</span>
                                {book.isDeleted ? (
                                    <Badge className="bg-red-100 text-red-600 hover:bg-red-200 border-none shadow-none uppercase font-bold text-[10px]">Archived</Badge>
                                ) : (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none uppercase font-bold text-[10px]">Active</Badge>
                                )}
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E3]">
                                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Categories</span>
                                <span className="text-[13px] font-bold text-[#161B22]">{book.categories.length} selected</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Elaborate Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 p-8 sm:p-10 space-y-8">
                        <div>
                            <h2 className="text-xl font-serif font-bold text-[#161B22] mb-1">General Information</h2>
                            <p className="text-[13px] text-gray-400 font-medium">Update the primary details for the catalog listing.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Title */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Book Title</Label>
                                <Input
                                    {...register('title')}
                                    className="h-12 bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all shadow-none"
                                />
                                {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message}</p>}
                            </div>

                            {/* Author */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Author</Label>
                                <Input
                                    {...register('author')}
                                    className="h-12 bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all shadow-none"
                                />
                                {errors.author && <p className="text-[10px] text-red-500 font-bold">{errors.author.message}</p>}
                            </div>

                            {/* Publisher */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Publisher</Label>
                                <Input
                                    {...register('publisher')}
                                    className="h-12 bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all shadow-none"
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Price ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { valueAsNumber: true })}
                                    className="h-12 bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all shadow-none text-lg font-bold"
                                />
                                {errors.price && <p className="text-[10px] text-red-500 font-bold">{errors.price.message}</p>}
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Inventory Stock</Label>
                                <Input
                                    type="number"
                                    {...register('quantity', { valueAsNumber: true })}
                                    className={`h-12 bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all shadow-none text-lg font-bold ${watch('quantity') < 10 ? 'text-red-500' : 'text-[#2F7E4C]'}`}
                                />
                                {errors.quantity && <p className="text-[10px] text-red-500 font-bold">{errors.quantity.message}</p>}
                            </div>

                            {/* ISBN */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">ISBN Identifier</Label>
                                <Input
                                    {...register('isbn')}
                                    className="h-12 bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all shadow-none font-mono"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Synopsis / Description</Label>
                                <Textarea
                                    {...register('description')}
                                    rows={5}
                                    className="bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all min-h-[140px] resize-none shadow-none leading-relaxed"
                                />
                            </div>

                            {/* Categories */}
                            <div className="space-y-4 md:col-span-2 pt-4">
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-[#161B22] mb-1">Categories Classification</h3>
                                    <p className="text-[13px] text-gray-400 font-medium">Select all relevant genres to improve searchability.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-6 bg-[#F8F6F2] rounded-2xl border border-[#EAE8E3]/50">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center space-x-3 group cursor-pointer bg-white p-3 rounded-lg border border-[#EAE8E3] hover:border-[#EE6337] transition-all shadow-sm"
                                            onClick={() => {
                                                const current = selectedCategoryIds;
                                                const updated = current.includes(category.id)
                                                    ? current.filter(id => id !== category.id)
                                                    : [...current, category.id];
                                                setValue('categoryIds', updated, { shouldDirty: true });
                                            }}
                                        >
                                            <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center shrink-0 ${selectedCategoryIds.includes(category.id)
                                                ? 'bg-[#EE6337] border-[#EE6337]'
                                                : 'border-gray-300 bg-[#F6F5F2]'
                                                }`}>
                                                {selectedCategoryIds.includes(category.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="text-[13.5px] font-semibold text-gray-700 truncate">{category.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {errors.categoryIds && <p className="text-[10px] text-red-500 font-bold mt-2">{errors.categoryIds.message}</p>}
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] bg-white rounded-[24px] p-8 border-none shadow-2xl font-sans text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-8 h-8 text-[#C52A1A]" />
                    </div>
                    <DialogTitle className="text-2xl font-serif font-bold text-[#161B22] mb-2">Delete Book?</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
                        Are you sure you want to completely remove <br /><span className="text-[#161B22] font-bold">"{book.title}"</span>?<br />
                        This action will soft-delete the item.
                    </DialogDescription>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button
                            variant="destructive"
                            className="w-full bg-[#C52A1A] hover:bg-[#A52316] rounded-xl h-12 font-bold tracking-wide shadow-lg"
                            onClick={confirmDelete}
                        >
                            Yes, Archive Book
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-gray-400 font-bold hover:text-[#161B22]"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

