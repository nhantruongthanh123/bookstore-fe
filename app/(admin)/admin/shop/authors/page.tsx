'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Loader2,
    ChevronRight,
    Users,
    AlertCircle,
    UserCircle,
} from 'lucide-react';
import { authorService } from '@/lib/api/services/author.service';
import { AuthorResponse, AuthorRequest } from '@/types';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const authorSchema = z.object({
    name: z.string().min(1, 'Author name is required').max(100),
    description: z.string().optional().or(z.literal('')),
});

type AuthorFormData = z.infer<typeof authorSchema>;

export default function AdminAuthorsPage() {
    const router = useRouter();
    const [authors, setAuthors] = useState<AuthorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination and Filter
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filterName, setFilterName] = useState('');
    const [debouncedFilterName, setDebouncedFilterName] = useState('');

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingAuthor, setDeletingAuthor] = useState<AuthorResponse | null>(null);

    // Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AuthorFormData>({
        resolver: zodResolver(authorSchema),
        defaultValues: { name: '', description: '' },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilterName(filterName);
            setPage(0); // Reset page on query change
        }, 300);
        return () => clearTimeout(timer);
    }, [filterName]);

    // Load Data
    const fetchAuthors = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await authorService.getAuthors(page, 10, 'id', debouncedFilterName);
            setAuthors(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch authors', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedFilterName]);

    useEffect(() => {
        fetchAuthors();
    }, [fetchAuthors]);

    // Handlers
    const handleOpenCreateDialog = () => {
        reset({ name: '', description: '' });
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (data: AuthorFormData) => {
        setIsSaving(true);
        try {
            const payload: AuthorRequest = {
                name: data.name,
                description: data.description || undefined,
            };
            await authorService.createAuthor(payload);
            setIsDialogOpen(false);
            fetchAuthors();
        } catch (error) {
            console.error('Failed to create author', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (author: AuthorResponse) => {
        setDeletingAuthor(author);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingAuthor) return;
        try {
            await authorService.deleteAuthor(deletingAuthor.id);
            setIsDeleteDialogOpen(false);
            fetchAuthors();
        } catch (error) {
            console.error('Failed to delete author', error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">
            {/* Header / Breadcrumbs */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span className="cursor-pointer hover:text-gray-600 transition-colors" onClick={() => router.push('/admin')}>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Shop Management</span>
                    <ChevronRight className="w-3 h-3 text-[#EE6337]" />
                    <span className="text-[#EE6337]">Authors</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">
                            Author Roster
                        </h1>
                        <p className="text-[14px] text-gray-500 font-medium italic">
                            Manage the creators behind the books in your catalog.
                        </p>
                    </div>

                    <Button
                        onClick={handleOpenCreateDialog}
                        className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-6 py-6 rounded-xl shadow-lg transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        <span className="font-semibold tracking-wide">Add New Author</span>
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="px-8 lg:px-12 py-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E3]/50 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#EE6337] transition-colors" />
                        <Input
                            placeholder="Search authors by name..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="pl-10 h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="h-11 px-4 border-[#EAE8E3] rounded-xl text-gray-500 hover:text-[#161B22] hover:bg-[#F6F5F2]"
                        onClick={() => setFilterName('')}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="px-8 lg:px-12 py-4 flex-1">
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#F8F6F2] hover:bg-[#F8F6F2] border-b border-[#EAE8E3]">
                                <TableHead className="w-16 px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">ID</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Author Profile</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Description</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#EE6337] opacity-60" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4">
                                            Retrieving Creators...
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : authors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="max-w-xs mx-auto space-y-2">
                                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                                            <p className="text-[17px] font-serif font-bold text-[#161B22]">No authors discovered</p>
                                            <p className="text-sm text-gray-400">
                                                {filterName
                                                    ? 'Try adjusting your search criteria.'
                                                    : 'Start building your network of authors.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                authors.map((author) => (
                                    <TableRow
                                        key={author.id}
                                        className="group hover:bg-[#FAF9F6] border-b border-[#EAE8E3]/40 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/shop/authors/${author.id}`)}
                                    >
                                        <TableCell className="px-6 py-5">
                                            <span className="text-[12px] font-bold text-gray-300">
                                                #{String(author.id).padStart(3, '0')}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#F4F2EC] rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#EE6337]/10 transition-colors border border-gray-200">
                                                    <UserCircle className="w-5 h-5 text-[#EE6337]" />
                                                </div>
                                                <span className="text-[15px] font-serif font-bold text-[#161B22] group-hover:text-[#EE6337] transition-colors">
                                                    {author.name}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-5 max-w-[400px]">
                                            {author.description ? (
                                                <p className="text-[13px] text-gray-500 font-medium line-clamp-2">
                                                    {author.description}
                                                </p>
                                            ) : (
                                                <span className="text-[12px] text-gray-300 italic font-medium">
                                                    Biography pending
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 text-gray-400 hover:text-[#EE6337] hover:bg-[#EE6337]/10 rounded-lg transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/shop/authors/${author.id}`);
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 text-gray-400 hover:text-[#C52A1A] hover:bg-[#C52A1A]/10 rounded-lg transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(author);
                                                    }}
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
                                    className="border-[#EAE8E3] rounded-lg text-xs hover:bg-[#F6F5F2]"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="border-[#EAE8E3] rounded-lg text-xs hover:bg-[#F6F5F2]"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px] bg-white rounded-[24px] p-0 border-none shadow-2xl font-sans">
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <DialogHeader className="px-8 pt-8 pb-6 border-b border-[#EAE8E3]/50 bg-[#F8F6F2]/80 rounded-t-[24px]">
                            <DialogTitle className="text-2xl font-serif font-bold text-[#161B22]">
                                Enlist New Author
                            </DialogTitle>
                            <DialogDescription className="text-[13px] text-gray-500 font-medium">
                                Create an author profile to link your literary catalog against.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-8 py-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                                    Full Name
                                </Label>
                                <Input
                                    {...register('name')}
                                    placeholder="e.g. J.K. Rowling"
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all shadow-none"
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                                    Biography <span className="text-gray-300 normal-case font-medium tracking-normal">(optional)</span>
                                </Label>
                                <Textarea
                                    {...register('description')}
                                    rows={4}
                                    placeholder="Write a brief biography mapping their literary journey..."
                                    className="bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all min-h-[100px] resize-none shadow-none"
                                />
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
                                ) : 'Create Profile'}
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
                    <DialogTitle className="text-2xl font-serif font-bold text-[#161B22] mb-2">
                        Expel Author?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
                        Are you sure you want to completely erase{' '}
                        <span className="text-[#161B22] font-bold">&quot;{deletingAuthor?.name}&quot;</span>?
                        This action will cascade to any associated titles.
                    </DialogDescription>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button
                            variant="destructive"
                            className="w-full bg-[#C52A1A] hover:bg-[#A52316] rounded-xl h-12 font-bold tracking-wide shadow-lg active:scale-95"
                            onClick={confirmDelete}
                        >
                            Yes, Disassociate
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
