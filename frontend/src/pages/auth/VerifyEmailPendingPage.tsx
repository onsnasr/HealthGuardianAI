import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const VerifyEmailPendingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout, setUser } = useAuthStore();
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // Vérifier périodiquement si l'email est vérifié
    useEffect(() => {
        const checkVerificationStatus = async () => {
            if (!user?.email) return;

            setIsChecking(true);
            try {
                // Vérifier directement avec le backend
                const backendResponse = await fetch(`http://localhost:8081/api/auth/check-verification?email=${user.email}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (backendResponse.ok) {
                    const data = await backendResponse.json();
                    if (data.isActive) {
                        // Mettre à jour le store
                        setUser({
                            ...user,
                            isActive: true
                        });
                        toast.success('Email verified successfully! 🎉');
                        navigate('/dashboard');
                        return;
                    }
                }
            } catch (error) {
                console.error('Failed to check verification status:', error);
            } finally {
                setIsChecking(false);
            }
        };

        // Vérifier immédiatement au chargement
        checkVerificationStatus();

        // Puis vérifier toutes les 5 secondes
        const checkVerificationInterval = setInterval(checkVerificationStatus, 5000);

        return () => clearInterval(checkVerificationInterval);
    }, [user, setUser, navigate]);

    const handleResendEmail = async () => {
        if (!user?.email) {
            toast.error('Email address not found');
            return;
        }

        setIsResending(true);
        try {
            const apiResponse = await fetch('http://localhost:8081/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email }),
            });

            if (!apiResponse.ok) {
                throw new Error('Failed to resend email');
            }

            toast.success('Verification email sent! Check your inbox 📧');
        } catch (error) {
            toast.error('Failed to resend verification email');
        } finally {
            setIsResending(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const handleCheckNow = async () => {
        if (!user?.email) return;

        setIsChecking(true);
        try {
            const checkResponse = await fetch(`http://localhost:8081/api/auth/check-verification?email=${user.email}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (checkResponse.ok) {
                const data = await checkResponse.json();
                if (data.isActive) {
                    setUser({
                        ...user,
                        isActive: true
                    });
                    toast.success('Email verified successfully! 🎉');
                    navigate('/dashboard');
                } else {
                    toast('Email not verified yet. Please check your inbox.', {
                        icon: '📧',
                        duration: 4000,
                    });
                }
            } else {
                toast.error('Failed to check verification status');
            }
        } catch (error) {
            toast.error('Failed to check verification status');
        } finally {
            setIsChecking(false);
        }
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
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full">
                            <Mail className="w-10 h-10 text-primary-600" />
                        </div>
                    </div>

                    {/* Title & Message */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-gray-600 mb-4">
                        We've sent a verification email to:
                    </p>
                    <p className="text-primary-600 font-semibold mb-6 break-all">{user?.email}</p>
                    <p className="text-gray-600 text-sm mb-6">
                        Please check your inbox and click the verification link to activate your account and access all features.
                    </p>

                    {/* Auto-check indicator */}
                    <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center gap-2 text-blue-700">
                            <div className={`w-2 h-2 rounded-full ${isChecking ? 'bg-blue-500 animate-pulse' : 'bg-blue-300'}`}></div>
                            <span className="text-sm font-medium">
                {isChecking ? 'Checking verification status...' : 'Automatically checking every 5 seconds'}
              </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleResendEmail}
                            isLoading={isResending}
                            leftIcon={<RefreshCw className="w-5 h-5" />}
                        >
                            Resend Verification Email
                        </Button>

                        <Button
                            variant="outline"
                            fullWidth
                            onClick={handleCheckNow}
                            isLoading={isChecking}
                            leftIcon={<CheckCircle className="w-5 h-5" />}
                        >
                            Check Verification Now
                        </Button>

                        <Button
                            variant="outline"
                            fullWidth
                            onClick={handleLogout}
                            leftIcon={<LogOut className="w-5 h-5" />}
                        >
                            Sign Out
                        </Button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800 text-left">
                                <p className="font-medium">Didn't receive the email?</p>
                                <ul className="mt-1 list-disc list-inside space-y-1">
                                    <li>Check your spam folder</li>
                                    <li>Make sure you entered the correct email address</li>
                                    <li>Wait a few minutes and try again</li>
                                    <li>Click "Resend Verification Email" above</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmailPendingPage;