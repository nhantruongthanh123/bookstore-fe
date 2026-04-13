'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Loader2,
    ChevronRight,
    Tag,
    AlertCircle,
    BookOpen,
} from 'lucide-react';
import { categoryService } from '@/lib/api/services/category.service';
import { CategoryResponse, CategoryRequest } from '@/types';
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

const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    description: z.string().optional().or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [filterName, setFilterName] = useState('');

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);

    // Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: '', description: '' },
    });

    // Derived — filtered client-side (no paginated API for categories)
    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(filterName.toLowerCase())
    );

    // Load Data
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handlers
    const handleOpenDialog = (category?: CategoryResponse) => {
        if (category) {
            setEditingCategory(category);
            reset({ name: category.name, description: category.description ?? '' });
        } else {
            setEditingCategory(null);
            reset({ name: '', description: '' });
        }
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (data: CategoryFormData) => {
        setIsSaving(true);
        try {
            const payload: CategoryRequest = {
                name: data.name,
                description: data.description || undefined,
            };
            if (editingCategory) {
                await categoryService.updateCategory(editingCategory.id, payload);
            } else {
                await categoryService.createCategory(payload);
            }
            setIsDialogOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (category: CategoryResponse) => {
        setDeletingCategory(category);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingCategory) return;
        try {
            await categoryService.deleteCategory(deletingCategory.id);
            setIsDeleteDialogOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category', error);
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
                    <span className="text-[#EE6337]">Categories</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">
                            Category Taxonomy
                        </h1>
                        <p className="text-[14px] text-gray-500 font-medium italic">
                            Organise the bookstore&apos;s literary genres and subject areas.
                        </p>
                    </div>

                    <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-6 py-6 rounded-xl shadow-lg transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        <span className="font-semibold tracking-wide">Add New Category</span>
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-8 lg:px-12 py-2">
                <div className="flex gap-4">
                    <div className="bg-white border border-[#EAE8E3]/50 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-[#F4F2EC] rounded-xl flex items-center justify-center">
                            <Tag className="w-5 h-5 text-[#EE6337]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Categories</p>
                            <p className="text-2xl font-serif font-bold text-[#161B22]">{categories.length}</p>
                        </div>
                    </div>
                    <div className="bg-white border border-[#EAE8E3]/50 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-[#F4F2EC] rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-[#0A192F]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Matching Filter</p>
                            <p className="text-2xl font-serif font-bold text-[#161B22]">{filtered.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="px-8 lg:px-12 py-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E3]/50 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#EE6337] transition-colors" />
                        <Input
                            placeholder="Search categories..."
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
                                <TableHead className="w-16 px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">#</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Category Name</TableHead>
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
                                            Cataloguing Genres...
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="max-w-xs mx-auto space-y-2">
                                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                                            <p className="text-[17px] font-serif font-bold text-[#161B22]">No categories found</p>
                                            <p className="text-sm text-gray-400">
                                                {filterName
                                                    ? 'Try adjusting your search or clear the filter.'
                                                    : 'Add your first category to begin organising the catalog.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((category, index) => (
                                    <TableRow
                                        key={category.id}
                                        className="group hover:bg-[#FAF9F6] border-b border-[#EAE8E3]/40 transition-colors"
                                    >
                                        {/* Index */}
                                        <TableCell className="px-6 py-5">
                                            <span className="text-[12px] font-bold text-gray-300">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </TableCell>

                                        {/* Name */}
                                        <TableCell className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-[#F4F2EC] rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#EE6337]/10 transition-colors">
                                                    <Tag className="w-4 h-4 text-[#EE6337]" />
                                                </div>
                                                <span className="text-[15px] font-serif font-bold text-[#161B22] group-hover:text-[#EE6337] transition-colors">
                                                    {category.name}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Description */}
                                        <TableCell className="px-6 py-5 max-w-[400px]">
                                            {category.description ? (
                                                <p className="text-[13px] text-gray-500 font-medium line-clamp-2">
                                                    {category.description}
                                                </p>
                                            ) : (
                                                <span className="text-[12px] text-gray-300 italic font-medium">
                                                    No description provided
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 text-gray-400 hover:text-[#EE6337] hover:bg-[#EE6337]/10 rounded-lg transition-all"
                                                    onClick={() => handleOpenDialog(category)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 text-gray-400 hover:text-[#C52A1A] hover:bg-[#C52A1A]/10 rounded-lg transition-all"
                                                    onClick={() => handleDeleteClick(category)}
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

                    {/* Table Footer */}
                    {!isLoading && filtered.length > 0 && (
                        <div className="px-8 py-5 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] flex items-center justify-between">
                            <p className="text-[12px] font-medium text-gray-400">
                                Showing{' '}
                                <span className="text-[#161B22] font-bold">{filtered.length}</span>{' '}
                                of{' '}
                                <span className="text-[#161B22] font-bold">{categories.length}</span>{' '}
                                categories
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px] bg-white rounded-[24px] p-0 border-none shadow-2xl font-sans">
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <DialogHeader className="px-8 pt-8 pb-6 border-b border-[#EAE8E3]/50 bg-[#F8F6F2]/80 rounded-t-[24px]">
                            <DialogTitle className="text-2xl font-serif font-bold text-[#161B22]">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </DialogTitle>
                            <DialogDescription className="text-[13px] text-gray-500 font-medium">
                                {editingCategory
                                    ? 'Update the details of this genre.'
                                    : 'Define a new genre or subject area for the catalog.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-8 py-8 space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                                    Category Name
                                </Label>
                                <Input
                                    {...register('name')}
                                    placeholder="e.g. Science Fiction"
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                                    Description <span className="text-gray-300 normal-case font-medium tracking-normal">(optional)</span>
                                </Label>
                                <Textarea
                                    {...register('description')}
                                    rows={4}
                                    placeholder="Briefly describe this category..."
                                    className="bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all min-h-[100px] resize-none"
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
                                ) : editingCategory ? 'Save Changes' : 'Create Category'}
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
                        Remove Category?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
                        Are you sure you want to delete{' '}
                        <span className="text-[#161B22] font-bold">&quot;{deletingCategory?.name}&quot;</span>?
                        Books assigned to this category may lose their classification.
                    </DialogDescription>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button
                            variant="destructive"
                            className="w-full bg-[#C52A1A] hover:bg-[#A52316] rounded-xl h-12 font-bold tracking-wide shadow-lg active:scale-95"
                            onClick={confirmDelete}
                        >
                            Delete Category
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-gray-400 font-bold hover:text-gray-600"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Keep Category
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}