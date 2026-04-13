'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Camera, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HomeFooter } from '@/components/layout/home-footer';
import { HomeHeader } from '@/components/layout/home-header';
import { fileService } from '@/lib/api/services/file.service';
import { userService } from '@/lib/api/services/user.service';
import Cookies from 'js-cookie';

export default function EditProfilePage() {
    const { user, setAuth, isInitialized, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push('/login');
        }
    }, [isInitialized, isAuthenticated, router]);

    const [formError, setFormError] = useState('');
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingPhoto(true);
            const url = await fileService.uploadImage(file);
            setFormData(prev => ({ ...prev, avatar: url }));
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Failed to upload image");
        } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        avatar: ''
    });

    const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                gender: user.gender || '',
                avatar: user.avatar || ''
            });
        }

        const token = Cookies.get("accessToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.picture) setGoogleAvatar(payload.picture);
            } catch (e) { }
        }
    }, [user]);

    if (!isInitialized || (isAuthenticated && !user)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FCFBFA]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cd5227]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Let useEffect handle redirect
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // --- Validation Logic ---
        if (formData.fullName && formData.fullName.trim().length < 2) {
            setFormError("Full name must be at least 2 characters long.");
            return;
        }

        if (formData.phoneNumber) {
            const phoneRegex = /^[\d\s\+\-\(\)]+$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                setFormError("Phone number can only contain numbers and basic symbols (+, -, (), spaces).");
                alert("Phone number can only contain numbers.");
                return;
            }

            const digitCount = formData.phoneNumber.replace(/\D/g, '').length;
            if (digitCount < 9 || digitCount > 15) {
                setFormError("Please enter a valid phone number (between 9 and 15 digits).");
                return;
            }
        }

        if (formData.address && formData.address.trim().length < 10) {
            setFormError("Shipping address must be at least 10 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            // Clean up the date payload right before sending. 
            // If it's a valid date, backend may require an ISO string segment.
            const payload = {
                ...formData,
                dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : undefined,
            };

            const updatedProfile = await userService.updateProfile(payload);

            // Globally update the Zustand Store so the navbar and /profile reflect immediately
            setAuth(updatedProfile);

            // Redirect smoothly back to the profile dashboard
            router.push('/profile');
        } catch (error) {
            console.error("Error updating profile", error);
            alert("Failed to update profile. Please verify your data and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FCFBFA] relative font-sans pb-16">
            <HomeHeader />

            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
                style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            ></div>

            <div className="container relative mx-auto max-w-3xl py-12 px-4 space-y-12">

                {/* Form Card */}
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-[#EAE8E3]/50 overflow-hidden">
                    {/* Form Header */}
                    <div className="px-8 py-8 md:px-12 md:py-10 border-b border-[#EAE8E3]/50 bg-[#F8F6F2]">
                        <h1 className="text-3xl font-serif text-[#161B22] font-semibold tracking-tight">Edit Profile</h1>
                        <p className="text-sm text-gray-500 mt-2">Update your personal information and preferences.</p>

                        {formError && (
                            <div className="mt-4 p-3 text-[13px] bg-red-50 text-red-600 rounded-md border border-red-100 font-medium">
                                {formError}
                            </div>
                        )}
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="px-8 py-10 md:px-12">

                        {/* Avatar / Profile Row */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            <div className="relative shrink-0 group cursor-pointer" onClick={handlePhotoClick}>
                                <Avatar className="w-28 h-28 border-4 border-[#F6F5F2] shadow-sm">
                                    <AvatarImage className="object-cover" src={formData.avatar || user.avatar || googleAvatar || ""} alt="Avatar" />
                                    <AvatarFallback className="bg-[#cd5227] text-white text-3xl font-serif">
                                        {(formData.fullName || user.username || "?").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button type="button" className="absolute bottom-1 right-1 p-2 bg-[#161B22] hover:bg-[#2d3758] text-white rounded-full shadow-md transition-colors border-2 border-white">
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                                {isUploadingPhoto && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center md:text-left flex-1 space-y-1 mt-1">
                                <h2 className="text-2xl font-serif text-[#161B22] font-semibold tracking-tight">
                                    {user.fullName || user.username}
                                </h2>
                                <p className="text-[13px] text-gray-400 font-medium pb-2">
                                    Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>

                                <button
                                    type="button"
                                    onClick={handlePhotoClick}
                                    className="text-[11px] font-bold text-[#EE6337] hover:text-[#D5532A] uppercase tracking-wider transition-colors disabled:opacity-50"
                                    disabled={isUploadingPhoto}
                                >
                                    {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Input: Full Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full h-11 px-4 rounded-lg bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 focus:ring-2 focus:ring-[#EE6337]/20 outline-none transition-all text-[#161B22] text-[15px] font-medium"
                                />
                            </div>

                            {/* Input: Phone Number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full h-11 px-4 rounded-lg bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 focus:ring-2 focus:ring-[#EE6337]/20 outline-none transition-all text-[#161B22] text-[15px] font-medium"
                                />
                            </div>

                            {/* Input: Date of Birth */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-lg bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 focus:ring-2 focus:ring-[#EE6337]/20 outline-none transition-all text-[#161B22] text-[15px] font-medium cursor-text"
                                />
                            </div>

                            {/* Input: Gender */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-lg bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 focus:ring-2 focus:ring-[#EE6337]/20 outline-none transition-all text-[#161B22] text-[15px] font-medium appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-gray-400">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            {/* Input: Address (Full Width) */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Shipping Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="123 Book St, Library District, City..."
                                    className="w-full p-4 rounded-lg bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 focus:ring-2 focus:ring-[#EE6337]/20 outline-none transition-all text-[#161B22] text-[15px] font-medium resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-12 flex justify-end items-center gap-6 pt-2">
                            <Link
                                href="/profile"
                                className="text-sm font-semibold text-gray-500 hover:text-[#161B22] transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-[#0A192F] hover:bg-[#162A4B] text-white font-semibold text-[13px] tracking-wide rounded-lg transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(10,25,47,0.39)] hover:shadow-[0_6px_20px_rgba(10,25,47,0.23)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2 hidden" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Quote Section (Outside the card) */}
                <div className="text-center space-y-3 pt-6 pb-4">
                    <h3 className="text-[19px] md:text-xl font-serif italic text-gray-500">
                        "A room without books is like a body without a soul."
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        — Marcus Tullius Cicero
                    </p>
                </div>

            </div>
            <HomeFooter />
        </div>
    );
}