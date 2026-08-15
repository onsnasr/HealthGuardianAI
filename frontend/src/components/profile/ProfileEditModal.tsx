import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Mail, Phone, MapPin, Calendar, Activity, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuthStore } from '../../store/authStore';
import { useHealthPlanStore } from '../../store/healthPlanStore';
import { userAPI } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const profileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    age: z.number().min(1).max(120).optional(),
    weight: z.number().min(1).max(500).optional(),
    height: z.number().min(0.5).max(3).optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    medicalHistory: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
    const { user, setUser } = useAuthStore();
    const { fetchHealthPlan } = useHealthPlanStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'health'>('personal');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            age: user?.age,
            weight: user?.weight,
            height: user?.height,
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        try {
            if (!user?.id) {
                toast.error('User not found');
                return;
            }

            // Call API to update profile
            const updatedUser = await userAPI.updateProfile(user.id, data);

            // Update local state
            setUser(updatedUser);

            toast.success('Profile updated successfully! ✅');
            
            // If health info was updated (age, weight, height), refresh the health plan
            if (activeTab === 'health' && (data.age || data.weight || data.height)) {
                toast.success('Mise à jour du plan de santé...');
                await fetchHealthPlan();
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
            
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Edit Profile</h2>
                                <p className="text-white/80 text-sm mt-1">Update your personal information</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 py-3 px-4 font-medium transition-colors ${
                                activeTab === 'personal'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Personal Info
                        </button>
                        <button
                            onClick={() => setActiveTab('health')}
                            className={`flex-1 py-3 px-4 font-medium transition-colors ${
                                activeTab === 'health'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Health Info
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[60vh]">
                        {activeTab === 'personal' ? (
                            <div className="space-y-4">
                                {/* Profile Picture */}
                                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {user?.firstName[0]}{user?.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Profile Picture</p>
                                        <Button variant="outline" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                                            Upload Photo
                                        </Button>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        leftIcon={<User className="w-5 h-5" />}
                                        error={errors.firstName?.message}
                                        {...register('firstName')}
                                    />
                                    <Input
                                        label="Last Name"
                                        leftIcon={<User className="w-5 h-5" />}
                                        error={errors.lastName?.message}
                                        {...register('lastName')}
                                    />
                                </div>

                                {/* Email */}
                                <Input
                                    label="Email"
                                    type="email"
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />

                                {/* Phone */}
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    leftIcon={<Phone className="w-5 h-5" />}
                                    placeholder="+216 XX XXX XXX"
                                    {...register('phoneNumber')}
                                />

                                {/* Address */}
                                <Input
                                    label="Address"
                                    leftIcon={<MapPin className="w-5 h-5" />}
                                    placeholder="City, Country"
                                    {...register('address')}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Age */}
                                <Input
                                    label="Age"
                                    type="number"
                                    leftIcon={<Calendar className="w-5 h-5" />}
                                    placeholder="25"
                                    error={errors.age?.message}
                                    {...register('age', { valueAsNumber: true })}
                                />

                                {/* Weight & Height */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Weight (kg)"
                                        type="number"
                                        step="0.1"
                                        leftIcon={<Activity className="w-5 h-5" />}
                                        placeholder="70.5"
                                        error={errors.weight?.message}
                                        {...register('weight', { valueAsNumber: true })}
                                    />
                                    <Input
                                        label="Height (m)"
                                        type="number"
                                        step="0.01"
                                        leftIcon={<Activity className="w-5 h-5" />}
                                        placeholder="1.75"
                                        error={errors.height?.message}
                                        {...register('height', { valueAsNumber: true })}
                                    />
                                </div>

                                {/* Medical History */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Medical History
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Any chronic conditions, allergies, or past medical issues..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        {...register('medicalHistory')}
                                    />
                                </div>

                                {/* BMI Display */}
                                {user?.bmi && (
                                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                                        <p className="text-sm text-gray-600 mb-1">Current BMI</p>
                                        <p className="text-2xl font-bold text-primary-600">{user.bmi.toFixed(1)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit(onSubmit)}
                            isLoading={isLoading}
                        >
                            Save Changes
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};