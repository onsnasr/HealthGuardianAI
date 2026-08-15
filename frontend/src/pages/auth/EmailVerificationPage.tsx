import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'already_verified' | 'error'>('loading');
    const [isResending, setIsResending] = useState(false);

    const { user, setUser, logout } = useAuthStore(); // 🆕 AJOUTER logout

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (token) {
            verifyEmailBackend();
        } else {
            setStatus('error');
            toast.error('No verification token found');
        }
    }, [token]);

    const verifyEmailBackend = async () => {
        try {
            console.log('Starting verification with token:', token);

            const apiResponse = await fetch(`http://localhost:8081/api/auth/verify-email?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('API Response status:', apiResponse.status);

            if (apiResponse.status === 400) {
                const errorData = await apiResponse.json();
                if (errorData.message?.includes('already been used')) {
                    setStatus('already_verified');
                    toast.success('Your email is already verified! 🎉');

                    if (user && email === user.email) {
                        setUser({
                            ...user,
                            isActive: true
                        });
                    }

                    setTimeout(() => {
                        navigate('/signin');
                    }, 3000);
                    return;
                }
            }

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('API Error response:', errorText);
                throw new Error(`Verification failed: ${apiResponse.status} ${errorText}`);
            }

            const responseData = await apiResponse.json();
            console.log('API Success response:', responseData);

            // METTRE À JOUR LE STORE
            if (user && email === user.email) {
                setUser({
                    ...user,
                    isActive: true
                });
                console.log('Store updated with isActive: true');
            }

            setStatus('success');
            toast.success('Email verified successfully! 🎉');

            // 🆕 DÉCONNEXION AUTOMATIQUE après vérification
            setTimeout(() => {
                logout(); // Déconnecter l'utilisateur
                navigate('/signin'); // Rediriger vers signin
            }, 3000);

        } catch (error: any) {
            console.error('Verification error details:', error);
            setStatus('error');
            toast.error(`Verification failed: ${error.message}`);
        }
    };

    const handleResendEmail = async () => {
        if (!email) {
            toast.error('Email address not found');
            return;
        }

        setIsResending(true);
        try {
            console.log('Resending verification to:', email);

            const apiResponse = await fetch('http://localhost:8081/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            console.log('Resend API Response status:', apiResponse.status);

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('Resend API Error:', errorText);
                throw new Error('Failed to resend email');
            }

            toast.success('Verification email sent! Check your inbox 📧');
        } catch (error) {
            console.error('Resend error:', error);
            toast.error('Failed to resend verification email');
        } finally {
            setIsResending(false);
        }
    };

    const handleGoToSignIn = () => {
        // 🆕 DÉCONNEXION MANUELLE quand l'utilisateur clique sur le bouton
        logout();
        navigate('/signin');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                    {/* Icon */}
                    <div className="mb-6">
                        {status === 'loading' && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full">
                                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        )}
                        {status === 'already_verified' && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
                                <CheckCircle className="w-10 h-10 text-blue-600" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                        )}
                    </div>

                    {/* Title & Message */}
                    {status === 'loading' && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Your Email
                            </h1>
                            <p className="text-gray-600">
                                Please wait while we verify your email address...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Email Verified! 🎉
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Your email has been successfully verified. You will be redirected to sign in...
                            </p>
                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleGoToSignIn}
                                >
                                    Go to Sign In Now
                                </Button>
                                <p className="text-sm text-gray-500">
                                    Auto-redirect in 3 seconds...
                                </p>
                            </div>
                        </>
                    )}

                    {status === 'already_verified' && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Already Verified! ✅
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Your email is already verified. You will be redirected to sign in...
                            </p>
                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleGoToSignIn}
                                >
                                    Go to Sign In Now
                                </Button>
                                <p className="text-sm text-gray-500">
                                    Auto-redirect in 3 seconds...
                                </p>
                            </div>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verification Failed
                            </h1>
                            <p className="text-gray-600 mb-6">
                                The verification link is invalid or has expired. Please request a new verification email.
                            </p>

                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleResendEmail}
                                    isLoading={isResending}
                                    leftIcon={<RefreshCw className="w-5 h-5" />}
                                    disabled={!email}
                                >
                                    Resend Verification Email
                                </Button>

                                <Button
                                    variant="outline"
                                    fullWidth
                                    onClick={handleGoToSignIn}
                                >
                                    Back to Sign In
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerificationPage;