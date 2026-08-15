import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useAuthStore } from '@/store/authStore';

const signUpSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@#$%^&+=!]/, 'Password must contain at least one special character'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const { signUp, isLoading } = useAuthStore();
    const [currentStep] = React.useState(1);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
    });

    const password = watch('password', '');

    const onSubmit = async (data: SignUpFormData) => {
        try {
            await signUp(data);
            navigate('/dashboard');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Error handled by axios interceptor
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
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                            <Shield className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Create Account
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Join HealthGuardian AI
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of 2 - Personal Information
              </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                className="bg-primary-500 h-2 rounded-full"
                                initial={{ width: '50%' }}
                                animate={{ width: currentStep === 1 ? '50%' : '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                placeholder="Ahmed"
                                leftIcon={<User className="w-5 h-5" />}
                                error={errors.firstName?.message}
                                {...register('firstName')}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Ben Ali"
                                leftIcon={<User className="w-5 h-5" />}
                                error={errors.lastName?.message}
                                {...register('lastName')}
                            />
                        </div>

                        {/* Email */}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="your.email@example.com"
                            leftIcon={<Mail className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        {/* Password */}
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                leftIcon={<Lock className="w-5 h-5" />}
                                error={errors.password?.message}
                                {...register('password')}
                            />
                            <PasswordStrength password={password} />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                            className="mt-6"
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/signin"
                                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-primary-600 hover:underline">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:underline">
                        Privacy Policy
                    </a>
                </p>
            </motion.div>
        </div>
    );
};