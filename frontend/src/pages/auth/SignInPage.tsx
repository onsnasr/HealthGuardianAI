import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/authStore';

interface SignInFormData {
    email: string;
    password: string;
}

export const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, setUser } = useAuthStore();
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>();

    const handleSignIn = async (data: SignInFormData) => {
        setIsLoading(true);
        try {
            await signIn(data);

            // 🆕 METTRE À JOUR l'utilisateur après la connexion
            // Récupérer le token du localStorage
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Appeler l'API pour récupérer les données utilisateur fraîches
                    const response = await fetch('http://localhost:8081/api/users/me', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        // Mettre à jour le store avec les données fraîches
                        setUser({
                            id: userData.id,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            email: userData.email,
                            role: userData.role,
                            isProfileComplete: userData.isProfileComplete,
                            isActive: userData.isActive,
                            createdAt: userData.createdAt,
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    // Continuer même si l'appel échoue
                }
            }

            // 🔥 SUPPRIMÉ : Le toast est maintenant géré dans authStore
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
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
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                        <span className="text-white text-2xl font-bold">H</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        HealthGuardian AI
                    </h1>
                    <p className="text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                {/* Sign In Form */}
                <div className="bg-white rounded-2xl shadow-card p-8">
                    <form onSubmit={handleSubmit(handleSignIn)} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                error={errors.email?.message}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                }
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                error={errors.password?.message}
                            />
                        </div>

                        {/* Remember me and Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            New to HealthGuardian?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                Create Account
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignInPage;