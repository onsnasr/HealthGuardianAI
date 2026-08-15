import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@#$%^&+=!]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch('password', '');

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token || !email) {
            toast.error('Invalid reset link');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Réinitialisation du mot de passe
            await apiClient.post('/auth/reset-password', null, {
                params: {
                    token,
                    newPassword: data.password
                }
            });

            // 2. Connexion automatique avec le nouveau mot de passe
            try {
                const loginResponse = await apiClient.post('/auth/signin', {
                    email: email,
                    password: data.password
                });

                // Stockage du token et des infos utilisateur
                const { access_token, user } = loginResponse.data;

                localStorage.setItem('access_token', access_token);
                localStorage.setItem('user', JSON.stringify(user));

                setSuccess(true);
                toast.success('Password reset successfully! You are now logged in 🎉');

                // Redirection vers le dashboard après 2 secondes
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);

            } catch (loginError: any) {
                // Si la connexion automatique échoue
                console.error('Auto-login failed:', loginError);
                setSuccess(true);
                toast.success('Password reset successfully! Please sign in with your new password');

                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-card p-8 max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
                    <p className="text-gray-600 mb-6">
                        This password reset link is invalid or has expired.
                    </p>
                    <Button variant="secondary" onClick={() => navigate('/forgot-password')} fullWidth>
                        Request New Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                                    <Lock className="w-8 h-8 text-secondary-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Reset Password
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Enter your new password below
                                </p>
                                {email && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        for <strong>{email}</strong>
                                    </p>
                                )}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <Input
                                        label="New Password"
                                        type="password"
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="w-5 h-5" />}
                                        error={errors.password?.message}
                                        {...register('password')}
                                    />
                                    <PasswordStrength password={password} />
                                </div>

                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="••••••••"
                                    leftIcon={<Lock className="w-5 h-5" />}
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />

                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="lg"
                                    fullWidth
                                    isLoading={isLoading}
                                >
                                    Reset Password
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Password Reset!
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    Your password has been successfully reset. You are now logged in.
                                </p>

                                <Button variant="secondary" fullWidth onClick={() => navigate('/dashboard')}>
                                    Go to Sign in
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};