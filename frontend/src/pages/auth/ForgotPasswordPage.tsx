import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', null, {
                params: { email: data.email }
            });

            setEmailSent(true);
            toast.success('Password reset email sent! Check your inbox 📧');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {!emailSent ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                                    <Mail className="w-8 h-8 text-secondary-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    error={errors.email?.message}
                                    autoComplete="email"
                                    {...register('email')}
                                />

                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="lg"
                                    fullWidth
                                    isLoading={isLoading}
                                >
                                    Send Reset Link
                                </Button>
                            </form>

                            {/* Back to Sign In */}
                            <div className="mt-6 text-center">
                                <Link
                                    to="/signin"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-secondary-700 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Check Your Email
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    We've sent password reset instructions to your email address.
                                </p>

                                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                                    <p className="text-sm text-blue-800">
                                        📧 Didn't receive the email? Check your spam folder or{' '}
                                        <button
                                            onClick={() => setEmailSent(false)}
                                            className="font-medium underline hover:no-underline"
                                        >
                                            try again
                                        </button>
                                    </p>
                                </div>

                                <Link to="/signin">
                                    <Button variant="secondary" fullWidth>
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};