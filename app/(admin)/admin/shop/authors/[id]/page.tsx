'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Loader2,
    ChevronRight,
    ArrowLeft,
    Save,
    Trash2,
    AlertCircle,
    UserCircle
} from 'lucide-react';
import { authorService } from '@/lib/api/services/author.service';
import { AuthorResponse, AuthorRequest } from '@/types';
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

const authorSchema = z.object({
    name: z.string().min(1, 'Author name is required').max(100),
    description: z.string().optional().or(z.literal('')),
});

type AuthorFormData = z.infer<typeof authorSchema>;

export default function AuthorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const authorId = Number(params.id);

    const [author, setAuthor] = useState<AuthorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<AuthorFormData>({
        resolver: zodResolver(authorSchema),
        defaultValues: {
            name: '',
            description: '',
        }
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const authorData = await authorService.getAuthorById(authorId);
            setAuthor(authorData);
            reset({
                name: authorData.name,
                description: authorData.description || '',
            });
        } catch (error) {
            console.error('Failed to fetch author details', error);
        } finally {
            setIsLoading(false);
        }
    }, [authorId, reset]);

    useEffect(() => {
        if (!isNaN(authorId)) {
            fetchData();
        }
    }, [authorId, fetchData]);

    const handleFormSubmit = async (data: AuthorFormData) => {
        setIsSaving(true);
        try {
            const payload: AuthorRequest = {
                name: data.name,
                description: data.description || undefined,
            };
            await authorService.updateAuthor(authorId, payload);
            await fetchData();
        } catch (error) {
            console.error('Failed to update author', error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await authorService.deleteAuthor(authorId);
            setIsDeleteDialogOpen(false);
            router.push('/admin/shop/authors');
        } catch (error) {
            console.error('Failed to delete author', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FCFBFA]">
                <Loader2 className="w-12 h-12 text-[#EE6337] animate-spin mx-auto opacity-70" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mt-4">Loading Profile...</p>
            </div>
        );
    }

    if (!author) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FCFBFA]">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto opacity-70" />
                <p className="text-[15px] font-bold text-gray-500 mt-4">Author not found or could not be loaded.</p>
                <Button onClick={() => router.push('/admin/shop/authors')} className="mt-6">Back to Authors</Button>
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
                    <span className="cursor-pointer hover:text-gray-600 transition-colors" onClick={() => router.push('/admin/shop/authors')}>Shop Management</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="cursor-pointer hover:text-gray-600 transition-colors" onClick={() => router.push('/admin/shop/authors')}>Authors</span>
                    <ChevronRight className="w-3 h-3 text-[#EE6337]" />
                    <span className="text-[#EE6337] truncate max-w-[200px] inline-block align-bottom">{author.name}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-[#161B22]"
                                onClick={() => router.push('/admin/shop/authors')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#161B22] tracking-tight truncate max-w-[600px]">{author.name}</h1>
                        </div>
                        <p className="text-[14px] text-gray-500 font-medium italic pl-11">Review and modify the details for this author profile.</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="text-[#C52A1A] border-[#C52A1A]/30 hover:bg-[#C52A1A]/10 px-6 rounded-xl font-bold tracking-wide transition-all min-h-[44px]"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                        <Button
                            className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-8 rounded-xl font-bold tracking-wide shadow-lg transition-all active:scale-95 min-h-[44px]"
                            onClick={handleSubmit(handleFormSubmit)}
                            disabled={isSaving || !isDirty}
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

                    {/* Left Column: Image placeholder & Stats */}
                    <div className="space-y-6">
                        {/* Profile Placeholder Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE8E3]/50 flex flex-col items-center group relative min-h-[300px] justify-center">
                            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#EE6337] w-full text-left mb-6 absolute top-6 left-6">Visual Profile</h3>
                            
                            <div className="w-32 h-32 bg-[#F4F2EC] rounded-full flex flex-col items-center justify-center space-y-2 border border-[#EAE8E3]/80">
                                <UserCircle className="w-12 h-12 text-[#EE6337]/50" />
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium tracking-tight mt-6 text-center px-4">Author avatars are handled automatically via external linking or placeholders.</p>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-[#F8F6F2] p-6 rounded-2xl border border-[#EAE8E3] space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E3]">
                                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Author ID</span>
                                <span className="text-[14px] font-bold text-[#161B22] border px-2 py-0.5 rounded-md border-gray-300 bg-white">#{String(author.id).padStart(5, '0')}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E3]">
                                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Status</span>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none uppercase font-bold text-[10px]">Active</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Elaborate Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-[#EAE8E3]/50 p-8 sm:p-10 space-y-8">
                        <div>
                            <h2 className="text-xl font-serif font-bold text-[#161B22] mb-1">General Information</h2>
                            <p className="text-[13px] text-gray-400 font-medium">Update the primary details for this author.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Full Name</Label>
                                <Input
                                    {...register('name')}
                                    className="h-12 bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all shadow-none"
                                />
                                {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Biography / Description</Label>
                                <Textarea
                                    {...register('description')}
                                    rows={8}
                                    className="bg-[#F6F5F2] border-[#EAE8E3] focus:bg-white focus:border-[#EE6337] rounded-xl transition-all min-h-[140px] resize-none shadow-none leading-relaxed"
                                />
                                {errors.description && <p className="text-[10px] text-red-500 font-bold">{errors.description.message}</p>}
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
                    <DialogTitle className="text-2xl font-serif font-bold text-[#161B22] mb-2">Expel Author?</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
                        Are you sure you want to completely remove <br /><span className="text-[#161B22] font-bold">"{author.name}"</span>?<br />
                        This action will cascade to associated books.
                    </DialogDescription>
                    <div className="flex flex-col gap-3 mt-8">
                        <Button
                            variant="destructive"
                            className="w-full bg-[#C52A1A] hover:bg-[#A52316] rounded-xl h-12 font-bold tracking-wide shadow-lg"
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
