import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Stethoscope, Save } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';

// Validation Schema for Doctor Profile
const doctorProfileSchema = z.object({
    // Personal Info
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),

    // Professional Info
    specialty: z.string().min(2, 'Specialty is required'),
    licenseNumber: z.string().min(3, 'License number is required'),
    consultationFee: z.number().min(0, 'Consultation fee must be positive').optional(),
    yearsOfExperience: z.number().min(0, 'Years of experience must be positive').optional(),
    bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
});

type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

interface DoctorProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DoctorProfileEditModal: React.FC<DoctorProfileEditModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                              }) => {
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'personal' | 'professional'>('personal');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DoctorProfileFormData>({
        resolver: zodResolver(doctorProfileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            address: user?.address || '',
            specialty: (user as any)?.specialty || '',
            licenseNumber: (user as any)?.licenseNumber || '',
            consultationFee: (user as any)?.consultationFee || 0,
            yearsOfExperience: (user as any)?.yearsOfExperience || 0,
            bio: (user as any)?.bio || '',
        },
    });

    // Reset form when user data changes
    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                specialty: (user as any)?.specialty || '',
                licenseNumber: (user as any)?.licenseNumber || '',
                consultationFee: (user as any)?.consultationFee || 0,
                yearsOfExperience: (user as any)?.yearsOfExperience || 0,
                bio: (user as any)?.bio || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: DoctorProfileFormData) => {
        setIsLoading(true);
        try {
            // 🆕 Utiliser la route spécifique aux doctors
            await apiClient.put(`/users/doctor-profile/${user?.id}`, data);
// Update user in store
            if (user) {
                setUser({
                    ...user,
                    ...data,
                    isProfileComplete: true,
                });
            }

            toast.success('Profile updated successfully! ✅');
            onClose();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col"
                            style={{ height: '85vh', maxHeight: '700px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header - Fixed */}
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white rounded-t-2xl flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">Edit Profile</h2>
                                        <p className="text-blue-100 mt-1">
                                            Update your professional information
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs - Fixed */}
                            <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                        activeTab === 'personal'
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <User className="w-5 h-5" />
                                        Personal Info
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('professional')}
                                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                        activeTab === 'professional'
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Stethoscope className="w-5 h-5" />
                                        Professional Info
                                    </div>
                                </button>
                            </div>

                            {/* Form - Scrollable */}
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                                {/* Content - Scrollable Area */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {/* Personal Info Tab */}
                                    {activeTab === 'personal' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-5"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <Input
                                                    label="First Name"
                                                    placeholder="John"
                                                    error={errors.firstName?.message}
                                                    {...register('firstName')}
                                                />
                                                <Input
                                                    label="Last Name"
                                                    placeholder="Doe"
                                                    error={errors.lastName?.message}
                                                    {...register('lastName')}
                                                />
                                            </div>

                                            <Input
                                                label="Phone Number"
                                                type="tel"
                                                placeholder="+216 20 123 456"
                                                error={errors.phoneNumber?.message}
                                                {...register('phoneNumber')}
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Address
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="123 Medical Center, Tunis"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    {...register('address')}
                                                />
                                                {errors.address && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.address.message}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Professional Info Tab */}
                                    {activeTab === 'professional' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-5"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <Input
                                                    label="Specialty"
                                                    placeholder="Cardiology"
                                                    error={errors.specialty?.message}
                                                    {...register('specialty')}
                                                />
                                                <Input
                                                    label="License Number"
                                                    placeholder="TN-DOC-12345"
                                                    error={errors.licenseNumber?.message}
                                                    {...register('licenseNumber')}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <Input
                                                    label="Consultation Fee (TND)"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="50.00"
                                                    error={errors.consultationFee?.message}
                                                    {...register('consultationFee', { valueAsNumber: true })}
                                                />
                                                <Input
                                                    label="Years of Experience"
                                                    type="number"
                                                    placeholder="10"
                                                    error={errors.yearsOfExperience?.message}
                                                    {...register('yearsOfExperience', { valueAsNumber: true })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Professional Bio
                                                </label>
                                                <textarea
                                                    rows={5}
                                                    placeholder="Tell patients about your expertise, education, and approach to healthcare..."
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                    {...register('bio')}
                                                />
                                                {errors.bio && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.bio.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Maximum 1000 characters
                                                </p>
                                            </div>

                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>💡 Tip:</strong> A complete and detailed profile helps
                                                    patients understand your expertise and builds trust.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Footer - Fixed */}
                                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={isLoading}
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};