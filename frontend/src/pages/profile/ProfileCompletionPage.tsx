import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Activity, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';

const profileCompletionSchema = z.object({
    age: z.number().min(1, 'Age is required').max(120, 'Invalid age'),
    weight: z.number().min(1, 'Weight is required').max(500, 'Invalid weight'),
    height: z.number().min(0.5, 'Height is required').max(3, 'Invalid height'),
    medicalHistory: z.string().optional(),
});

type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>;

export const ProfileCompletionPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ProfileCompletionFormData>({
        resolver: zodResolver(profileCompletionSchema),
    });

    const age = watch('age');
    const weight = watch('weight');
    const height = watch('height');

    // Calculate BMI
    const calculateBMI = () => {
        if (weight && height) {
            return (weight / (height * height)).toFixed(1);
        }
        return null;
    };

    const onSubmit = async (data: ProfileCompletionFormData) => {
        setIsLoading(true);
        try {
            // API call to update profile
            await apiClient.put(`/users/profile/${user?.id}`, data);

            // Calculate BMI
            const bmi = data.weight && data.height ? data.weight / (data.height * data.height) : 0;

            // Update user in store
            if (user) {
                setUser({
                    ...user,
                    age: data.age,
                    weight: data.weight,
                    height: data.height,
                    medicalHistory: data.medicalHistory,
                    isProfileComplete: true,
                    bmi: parseFloat(bmi.toFixed(1))
                });
            }

            toast.success('Profile completed successfully! 🎉');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                            <Activity className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Complete Your Health Profile
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Help us personalize your health recommendations
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of 2
              </span>
                            <span className="text-sm text-gray-500">
                {currentStep === 1 ? 'Basic Info' : 'Medical History'}
              </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                                initial={{ width: '50%' }}
                                animate={{ width: currentStep === 1 ? '50%' : '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {currentStep === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Age */}
                                <Input
                                    label="Age (years)"
                                    type="number"
                                    placeholder="25"
                                    leftIcon={<Calendar className="w-5 h-5" />}
                                    error={errors.age?.message}
                                    {...register('age', { valueAsNumber: true })}
                                />

                                {/* Weight */}
                                <Input
                                    label="Weight (kg)"
                                    type="number"
                                    step="0.1"
                                    placeholder="70.5"
                                    leftIcon={<Activity className="w-5 h-5" />}
                                    error={errors.weight?.message}
                                    {...register('weight', { valueAsNumber: true })}
                                />

                                {/* Height */}
                                <Input
                                    label="Height (meters)"
                                    type="number"
                                    step="0.01"
                                    placeholder="1.75"
                                    leftIcon={<Activity className="w-5 h-5" />}
                                    error={errors.height?.message}
                                    {...register('height', { valueAsNumber: true })}
                                />

                                {/* BMI Preview */}
                                {calculateBMI() && (
                                    <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Your BMI</p>
                                                <p className="text-2xl font-bold text-primary-600">{calculateBMI()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Status</p>
                                                <p className="font-semibold text-gray-900">
                                                    {parseFloat(calculateBMI()!) < 18.5 ? 'Underweight' :
                                                        parseFloat(calculateBMI()!) < 25 ? 'Normal ✓' :
                                                            parseFloat(calculateBMI()!) < 30 ? 'Overweight' : 'Obese'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    onClick={() => {
                                        // Validate step 1 fields
                                        if (age && weight && height) {
                                            setCurrentStep(2);
                                        } else {
                                            toast.error('Please fill all required fields');
                                        }
                                    }}
                                    rightIcon={<ArrowRight className="w-5 h-5" />}
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Medical History */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Medical History (Optional)
                                    </label>
                                    <textarea
                                        rows={6}
                                        placeholder="Any chronic conditions, allergies, medications, or past medical issues..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        {...register('medicalHistory')}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This information helps us provide better recommendations
                                    </p>
                                </div>

                                {/* Summary */}
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Age:</span>
                                            <span className="font-medium">{age} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Weight:</span>
                                            <span className="font-medium">{weight} kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Height:</span>
                                            <span className="font-medium">{height} m</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">BMI:</span>
                                            <span className="font-medium text-primary-600">{calculateBMI()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        fullWidth
                                        onClick={() => setCurrentStep(1)}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        fullWidth
                                        size="lg"
                                        isLoading={isLoading}
                                        leftIcon={<CheckCircle className="w-5 h-5" />}
                                    >
                                        Complete Profile
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </form>

                    {/* Skip Option */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};